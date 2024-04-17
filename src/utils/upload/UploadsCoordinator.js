import fetchAPI from 'utils/http/fetchAPI';
import fileUploadConfig from 'utils/upload/fileUploadConfig';
import UploadStatus from 'utils/upload/UploadStatus';
import FileUploader from 'utils/upload/FileUploader';

class UploadsCoordinator {
  static get() {
    if (!UploadsCoordinator.instance) UploadsCoordinator.instance = new UploadsCoordinator();

    return UploadsCoordinator.instance;
  }

  constructor() {
    this.filesToUploadParams = [];
    this.uploading = false;

    this.uploadTrackingLock = 'uploadTrackingLock';
  }

  uploadFile = (params) => new Promise((resolve, reject) => {
    navigator.locks.request(this.uploadTrackingLock, async () => {
      if (this.uploading) {
        this.filesToUploadParams.push({ params, promise: { resolve, reject } });
        return;
      }

      this.uploading = true;
      this.#beginUpload(params, { resolve, reject });
    });
  })

  #beginUpload = async (params, promise) => {
    const [
      projectId,
      file,
      uploadUrlParams,
      type,
      abortController,
      onStatusUpdate,
      options,
    ] = params;

    try {
      const {
        uploadId, bucket, key,
      } = uploadUrlParams;

      if (!uploadId || !bucket || !key) {
        throw new Error('uploadUrlParams must contain uploadId, bucket, and key');
      }

      const uploadParams = {
        projectId,
        uploadId,
        bucket,
        key,
      };

      const fileUploader = new FileUploader(
        file,
        fileUploadConfig.chunkSize,
        uploadParams,
        abortController,
        onStatusUpdate,
        options,
      );

      onStatusUpdate(UploadStatus.UPLOADING);
      const parts = await fileUploader.upload();

      // S3 expects parts to be sorted by number
      parts.sort(({ PartNumber: PartNumber1 }, { PartNumber: PartNumber2 }) => {
        if (PartNumber1 === PartNumber2) throw new Error('Non-unique partNumbers found, each number should be unique');

        return PartNumber1 > PartNumber2 ? 1 : -1;
      });

      await this.#completeMultipartUpload(parts, uploadId, key, type);

      onStatusUpdate(UploadStatus.UPLOADED);

      promise.resolve();
    } catch (e) {
      onStatusUpdate(UploadStatus.UPLOAD_ERROR);
      console.error(e);
    }

    // Begin next upload
    navigator.locks.request(this.uploadTrackingLock, async () => {
      if (this.filesToUploadParams.length > 0) {
        const { params: nextParams, promise: nextPromise } = this.filesToUploadParams.shift();

        this.#beginUpload(nextParams, nextPromise);
      } else {
        this.uploading = false;
      }
    });
  }

  #completeMultipartUpload = async (parts, uploadId, s3Path, type) => {
    const requestUrl = '/v2/completeMultipartUpload';

    const body = {
      parts, uploadId, s3Path, type,
    };

    await fetchAPI(requestUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  }
}

export default UploadsCoordinator;
