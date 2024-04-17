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
    chunkSize,
    uploadParams,
    abortController,
    onStatusUpdate,
    options,
  ) {
    if (!file
      || !chunkSize
      || !uploadParams
      || !abortController
      || !onStatusUpdate
    ) {
      throw new Error('FileUploader: Missing required parameters');
    }
    const { resumeUpload, compress, retryPolicy = 'normal' } = options;

    this.file = file;
    this.compress = compress;
    this.chunkSize = chunkSize;
    this.uploadParams = uploadParams;
    this.resumeUpload = resumeUpload;
    this.retryPolicy = retryPolicy;

    // Upload related callbacks and handling
    this.onStatusUpdate = onStatusUpdate;
    this.abortController = abortController;

    // Stream handling
    this.totalChunks = Math.ceil(file.size / chunkSize);
    this.pendingChunks = this.totalChunks;

    // Locks to control the number of simultaneous uploads to avoid taking up too much ram
    this.freeUploadSlotsLock = `freeUploadSlots${this.uploadParams.uploadId}`;
    this.freeUploadSlots = 3;

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

    this.#subscribeToAbortSignal();
  }

  async upload() {
    let offset = 0;
    if (this.resumeUpload) {
      const uploadedParts = await this.#getUploadedParts();

      if (uploadedParts.length === this.totalChunks) {
        return uploadedParts;
      }

      const nextPartNumber = uploadedParts.length + 1;
      // setting all previous parts as uploaded
      // this.uploadedPartPercentages.fill(1, 0, nextPartNumber - 1);
      for (let i = 0; i < nextPartNumber - 1; i += 1) {
        this.uploadedPartPercentages[i] = 1;
        this.uploadedParts.push(uploadedParts[i]);
      }

      this.partNumberIt = nextPartNumber - 1;
      this.pendingChunks = this.totalChunks - nextPartNumber + 1;
      offset = this.partNumberIt * this.chunkSize;
    }

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.readStream = filereaderStream(
        this.file?.fileObject || this.file, { chunkSize: this.chunkSize, offset },
      );

      this.#setupReadStreamHandlers();

      if (this.compress) {
        this.gzipStream = new AsyncGzip({ level: 1, consume: true });
        this.#setupGzipStreamHandlers();
      }
    });
  }

  #subscribeToAbortSignal = () => {
    this.abortController.signal.addEventListener('abort', () => this.#cleanupExecution());
  }

  #uploadChunk = async (compressedPart, partNumber) => {
    const partResponse = await putInS3(
      compressedPart,
      () => this.#getSignedUrlForPart(partNumber),
      this.abortController,
      this.#createOnUploadProgress(partNumber),
      this.retryPolicy,
    );

    this.uploadedParts.push({ ETag: partResponse.headers.etag, PartNumber: partNumber });
  }

  #getSignedUrlForPart = async (partNumber) => {
    const {
      projectId, uploadId, bucket, key,
    } = this.uploadParams;

    const url = `/v2/projects/${projectId}/upload/${uploadId}/part/${partNumber}/signedUrl`;
    return await fetchAPI(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bucket,
        key,
      }),
    });
  };

  #getUploadedParts = async () => {
    const {
      projectId, uploadId, bucket, key,
    } = this.uploadParams;
    const url = `/v2/projects/${projectId}/upload/${uploadId}/getUploadedParts`;

    return await fetchAPI(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bucket,
        key,
      }),
    });
  }

  #createOnUploadProgress = (partNumber) => (progress) => {
    // partNumbers are 1-indexed, so we need to subtract 1 for the array index
    this.uploadedPartPercentages[partNumber - 1] = progress.progress;

    const percentage = (_.mean(this.uploadedPartPercentages) * 100).toFixed(2);
    this.onStatusUpdate(UploadStatus.UPLOADING, parseFloat(percentage));
  };

  #setupGzipStreamHandlers = () => {
    this.gzipStream.ondata = async (err, chunk) => {
      try {
        if (err) throw new Error(err);

        await this.#handleChunkLoadFinished(chunk);
      } catch (e) {
        this.#abortUpload(UploadStatus.FILE_READ_ERROR, e);
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
        this.#abortUpload(UploadStatus.FILE_READ_ERROR, e);
      }
    });

    this.readStream.on('error', (e) => {
      this.#abortUpload(UploadStatus.FILE_READ_ERROR, e);
    });

    this.readStream.on('end', async () => {
      try {
        if (!this.compress) return;

        await this.#reserveUploadSlot();

        this.gzipStream.push(this.currentChunk, true);
      } catch (e) {
        this.#abortUpload(UploadStatus.FILE_READ_ERROR, e);
      }
    });
  }

  #abortUpload = (status, e) => {
    this.abortController?.abort();

    this.onStatusUpdate(status);

    this.reject(e);
    console.error(e);
  }

  #cleanupExecution = () => {
    this.readStream?.destroy();
    this.gzipStream?.terminate();
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
      this.#abortUpload(UploadStatus.UPLOAD_ERROR, e);
    }
  }

  #reserveUploadSlot = async () => (
    await navigator.locks.request(this.freeUploadSlotsLock, async () => {
      this.freeUploadSlots -= 1;

      if (this.freeUploadSlots <= 0) {
        // We need to wait for some uploads to finish before we can continue
        this.readStream.pause();
      }
    })
  )

  #releaseUploadSlot = async () => (
    await navigator.locks.request(this.freeUploadSlotsLock, async () => {
      this.freeUploadSlots += 1;

      this.readStream.resume();
    })
  )
}

export default FileUploader;
