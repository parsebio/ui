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
  }

  uploadFile = (filesParams) => {
    this.filesToUploadParams.push(filesParams);

    // If no ongoing upload, begin
    if (!this.uploading) {
      this.uploading = true;
      const params = this.filesToUploadParams.shift();

      this.#beginUpload(...params);
    }
  }

  #beginUpload = async (
    projectId, file, uploadUrlParams, type, abortController, onStatusUpdate, options,
  ) => {
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

    let parts;

    try {
      const fileUploader = new FileUploader(
        file,
        fileUploadConfig.chunkSize,
        uploadParams,
        abortController,
        onStatusUpdate,
        options,
      );

      parts = await fileUploader.upload();

      // S3 expects parts to be sorted by number
      parts.sort(({ PartNumber: PartNumber1 }, { PartNumber: PartNumber2 }) => {
        if (PartNumber1 === PartNumber2) throw new Error('Non-unique partNumbers found, each number should be unique');

        return PartNumber1 > PartNumber2 ? 1 : -1;
      });
    } catch (e) {
      // Return silently, the error is handled in the onStatusUpdate callback
      return;
    }

    try {
      await this.#completeMultipartUpload(parts, uploadId, key, type);

      onStatusUpdate(UploadStatus.UPLOADED);
    } catch (e) {
      onStatusUpdate(UploadStatus.UPLOAD_ERROR);
    }

    // Begin next upload
    if (this.filesToUploadParams.length > 0) {
      const params = this.filesToUploadParams.shift();

      this.#beginUpload(...params);
    } else {
      this.uploading = false;
    }
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
