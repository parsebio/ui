import fetchAPI from 'utils/http/fetchAPI';
import fileUploadConfig from 'utils/upload/fileUploadConfig';
import UploadStatus from 'utils/upload/UploadStatus';
import FileUploader from 'utils/upload/FileUploader/FileUploader';
import UploadsCoordinatorError from 'utils/errors/upload/UploadsCoordinatorError';

const completeMultipartUpload = async (parts, uploadId, s3Path, type) => {
  const requestUrl = '/v2/completeMultipartUpload';

  const body = {
    parts, uploadId, s3Path, type,
  };

  await fetchAPI(
    requestUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );
};

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
  });

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

      await completeMultipartUpload(parts, uploadId, key, type);

      onStatusUpdate(UploadStatus.UPLOADED);

      promise.resolve();
    } catch (e) {
      promise.reject(new UploadsCoordinatorError(e.message));
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
  };
}

export default UploadsCoordinator;
