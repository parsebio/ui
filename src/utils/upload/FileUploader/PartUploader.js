import _ from 'lodash';

import fetchAPI from 'utils/http/fetchAPI';
import putInS3 from 'utils/upload/putInS3';

const PART_COUNT_MAX = 10000;
const PART_SIZE_MIN = 5 * 1024 * 1024;

class PartUploader {
  constructor(uploadParams, abortController, fileSize) {
    this.#uploadParams = uploadParams;
    this.#abortController = abortController;

    // Can't have more than 10000 parts
    const minPartSize = Math.ceil(fileSize / PART_COUNT_MAX);
    // Can't have parts be size less than 5MB
    this.#partSize = Math.max(minPartSize, PART_SIZE_MIN);
  }

  #uploadParams;

  #abortController;

  #partSize;

  // Used to assign partNumbers to each chunk
  #partNumberIt = 0;

  #accumulatedChunks = [];

  #uploadedParts = [];

  uploadChunk = async (chunk, onUploadProgress) => {
    this.#accumulatedChunks.push({ chunk, onUploadProgress });

    // Upload if we have accumulated partSize
    const canUpload = this.#getAccumulatedUploadSize() > this.#partSize;
    if (!canUpload) return;

    await this.#executeUpload();
  }

  finishUpload = async () => {
    if (this.#accumulatedChunks.length > 0) {
      await this.#executeUpload();
    }

    return this.#uploadedParts;
  }

  #executeUpload = async () => {
    this.#partNumberIt += 1;
    const partNumber = this.#partNumberIt;

    const mergedChunks = new Uint8Array(this.#getAccumulatedUploadSize());
    this.#accumulatedChunks.reduce((offset, { chunk, onUploadProgress }) => {
      mergedChunks.set(chunk, offset);

      return offset + chunk.length;
    }, 0);

    const partResponse = await putInS3(
      mergedChunks,
      async () => this.#getSignedUrlForPart(partNumber),
      this.#abortController,
      // this.#createOnUploadProgress(partNumber),
    );

    this.#accumulatedChunks = [];
    this.#uploadedParts.push({ ETag: partResponse.headers.etag, PartNumber: partNumber });
  }

  #getAccumulatedUploadSize = () => _.sum(_.map(this.#accumulatedChunks, 'chunk.length'))

  #getSignedUrlForPart = async (partNumber) => {
    const {
      projectId, uploadId, bucket, key,
    } = this.#uploadParams;

    const url = `/v2/projects/${projectId}/upload/${uploadId}/part/${partNumber}/signedUrl`;

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
