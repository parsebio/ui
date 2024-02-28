/* eslint-disable no-unused-expressions */
import _ from 'lodash';

import { AsyncGzip } from 'fflate';
import filereaderStream from 'filereader-stream';

import fetchAPI from 'utils/http/fetchAPI';
import putInS3 from 'utils/upload/putInS3';
import UploadStatus from 'utils/upload/UploadStatus';

class FileUploader {
  constructor(
    file,
    compress,
    chunkSize,
    uploadParams,
    abortController,
    onStatusUpdate,
  ) {
    if (!file
      || !chunkSize
      || !uploadParams
      || !abortController
      || !onStatusUpdate
    ) {
      throw new Error('FileUploader: Missing required parameters');
    }

    this.file = file;
    this.compress = compress;
    this.chunkSize = chunkSize;
    this.uploadParams = uploadParams;

    // Upload related callbacks and handling
    this.onStatusUpdate = onStatusUpdate;
    this.abortController = abortController;

    // Stream handling
    this.totalChunks = Math.ceil(file.size / chunkSize);
    this.pendingChunks = this.totalChunks;

    // Locks to control the number of simultaneous uploads to avoid taking up too much ram
    this.freeUploadSlotsLock = `freeUploadSlots${this.uploadParams.uploadId}`;
    this.freeUploadSlots = 5;

    // Used to assign partNumbers to each chunk
    this.partNumberIt = 0;

    this.readStream = null;
    this.gzipStream = null;

    this.uploadedParts = [];

    this.resolve = null;
    this.reject = null;

    // To track upload progress
    this.uploadedPartPercentages = new Array(this.totalChunks).fill(0);

    this.currentChunk = null;
  }

  async upload() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.readStream = filereaderStream(
        this.file?.fileObject || this.file, { chunkSize: this.chunkSize },
      );

      this.#setupReadStreamHandlers();

      if (this.compress) {
        this.gzipStream = new AsyncGzip({ level: 1, consume: true });
        this.#setupGzipStreamHandlers();
      }
    });
  }

  #uploadChunk = async (compressedPart, partNumber) => {
    const signedUrl = await this.#getSignedUrlForPart(partNumber);

    const partResponse = await putInS3(
      compressedPart,
      signedUrl,
      this.abortController,
      this.#createOnUploadProgress(partNumber),
    );

    this.uploadedParts.push({ ETag: partResponse.headers.etag, PartNumber: partNumber });
  }

  #getSignedUrlForPart = async (partNumber) => {
    const {
      projectId, uploadId, bucket, key,
    } = this.uploadParams;

    const queryParams = new URLSearchParams({ bucket, key });
    const url = `/v2/projects/${projectId}/upload/${uploadId}/part/${partNumber}/signedUrl?${queryParams}`;

    return await fetchAPI(url, { method: 'GET' });
  };

  #createOnUploadProgress = (partNumber) => (progress) => {
    // partNumbers are 1-indexed, so we need to subtract 1 for the array index
    this.uploadedPartPercentages[partNumber - 1] = progress.progress;

    const percentage = _.mean(this.uploadedPartPercentages) * 100;
    this.onStatusUpdate(UploadStatus.UPLOADING, Math.floor(percentage));
  };

  #setupGzipStreamHandlers = () => {
    this.gzipStream.ondata = async (err, chunk) => {
      try {
        if (err) throw new Error(err);

        await this.#handleChunkLoadFinished(chunk);
      } catch (e) {
        this.#cancelExecution(UploadStatus.FILE_READ_ERROR, e);
      }
    };
  }

  #setupReadStreamHandlers = () => {
    this.readStream.on('data', async (chunk) => {
      try {
        await this.#reserveUploadSlot();

        if (!this.compress) {
          // If not compressing, the load finishes as soon as the chunk is read
          await this.#handleChunkLoadFinished(chunk);
          return;
        }

        // This is necessary to connect the streams between read and compress.
        // gzipStream needs to know which is the last chunk when it is being pushed
        // but normal streams don't have a way of knowing that in the 'data' event
        // So we need to push the last chunk in the 'end' event.
        if (this.currentChunk !== null) this.gzipStream.push(this.currentChunk);

        this.currentChunk = chunk;
      } catch (e) {
        this.#cancelExecution(UploadStatus.FILE_READ_ERROR, e);
      }
    });

    this.readStream.on('error', (e) => {
      this.#cancelExecution(UploadStatus.FILE_READ_ERROR, e);
    });

    this.readStream.on('end', async () => {
      try {
        if (!this.compress) return;

        await this.#reserveUploadSlot();

        this.gzipStream.push(this.currentChunk, true);
      } catch (e) {
        this.#cancelExecution(UploadStatus.FILE_READ_ERROR, e);
      }
    });
  }

  #cancelExecution = (status, e) => {
    this.readStream.destroy();

    this.gzipStream?.terminate();
    this.abortController?.abort();

    this.onStatusUpdate(status);

    this.reject(e);
    console.error(e);
  }

  #handleChunkLoadFinished = async (chunk) => {
    // This assigns a part number to each chunk that arrives
    // They are read in order, so it should be safe
    this.partNumberIt += 1;

    try {
      await this.#uploadChunk(chunk, this.partNumberIt);

      // To track when all chunks have been uploaded
      this.pendingChunks -= 1;

      if (this.pendingChunks > 0) {
        await this.#releaseUploadSlot();
      }

      if (this.pendingChunks === 0) {
        this.resolve(this.uploadedParts);
      }
    } catch (e) {
      this.#cancelExecution(UploadStatus.UPLOAD_ERROR, e);
    }
  }

  #reserveUploadSlot = async () => (
    await navigator.locks.request(this.freeUploadSlotsLock, async () => {
      this.freeUploadSlots -= 1;

      console.log('thisfreeUploadSlotsLOCKING');
      console.log(this.freeUploadSlots);

      if (this.freeUploadSlots === 0) {
        // We need to wait for some uploads to finish before we can continue
        this.readStream.pause();
      }
    })
  )

  #releaseUploadSlot = async () => (
    await navigator.locks.request(this.freeUploadSlotsLock, async () => {
      console.log('thisfreeUploadSlotsRELEASING');
      console.log(this.freeUploadSlots);
      this.freeUploadSlots += 1;

      this.readStream.resume();
    })
  )
}

export default FileUploader;
