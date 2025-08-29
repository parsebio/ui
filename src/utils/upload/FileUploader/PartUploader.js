import _ from 'lodash';

import fetchAPI from 'utils/http/fetchAPI';
import putInS3 from 'utils/upload/putInS3';

const PART_COUNT_MAX = 10000;
const PART_SIZE_MIN = 5 * 1024 * 1024;

class PartUploader {
  constructor(uploadParams, abortController, fileSize, uploadedParts) {
    this.#uploadParams = uploadParams;
    this.#abortController = abortController;

    // Can't have more than 10000 parts
    const minPartSize = Math.ceil(fileSize / PART_COUNT_MAX);
    // Can't have parts be size less than 5MB
    this.#partSize = Math.max(minPartSize, PART_SIZE_MIN);

    this.#partUploadLock = `partUploadLock${this.#uploadParams.uploadId}`;

    this.#uploadedParts = uploadedParts;
  }

  #uploadParams;

  #abortController;

  #partSize;

  #partUploadLock;

  #accumulatedChunks = [];

  #uploadedParts;

  uploadChunk = async (chunk, onUploadProgress) => {
    await navigator.locks.request(this.#partUploadLock, async () => {
      this.#accumulatedChunks.push({ chunk, onUploadProgress });

      // Upload if we have accumulated partSize
      const canUpload = this.#getAccumulatedUploadSize() > this.#partSize;

      if (!canUpload) return;

      await this.#executeUpload();
    });
  };

  finishUpload = async () => {
    if (this.#accumulatedChunks.length > 0) {
      await this.#executeUpload();
    }

    return this.#uploadedParts;
  };

  #executeUpload = async () => {
    const partNumber = this.#uploadedParts.length + 1;

    const mergedChunks = new Uint8Array(this.#getAccumulatedUploadSize());

    const mergedOnUploadProgresses = [];
    this.#accumulatedChunks.reduce((offset, { chunk, onUploadProgress }) => {
      mergedChunks.set(chunk, offset);

      mergedOnUploadProgresses.push(onUploadProgress);

      return offset + chunk.length;
    }, 0);

    const partResponse = await putInS3(
      mergedChunks,
      async () => this.#getSignedUrlForPart(partNumber),
      this.#abortController,
      (progress) => mergedOnUploadProgresses.forEach((cb) => cb(progress)),
    );

    this.#accumulatedChunks = [];

    this.#uploadedParts.push({ ETag: partResponse.headers.etag, PartNumber: partNumber });
  };

  #getAccumulatedUploadSize = () => _.sum(_.map(this.#accumulatedChunks, 'chunk.length'));

  #getSignedUrlForPart = async (partNumber) => {
    const {
      projectId, uploadId, bucket, key, type,
    } = this.#uploadParams;
    console.log('TYPE ', type);
    let url = `/v2/projects/${projectId}/upload/${uploadId}/part/${partNumber}/signedUrl`;

    if (type === 'genome') {
      url = `/v2/genomes/${projectId}/upload/${uploadId}/part/${partNumber}/signedUrl`;
    }

    return await fetchAPI(
      url,
      {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ bucket, key }),
      },
    );
  };
}

export default PartUploader;
