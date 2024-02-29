import fetchAPI from 'utils/http/fetchAPI';
import fileUploadConfig from 'utils/upload/fileUploadConfig';
import UploadStatus from './UploadStatus';
import FileUploader from './FileUploader';

const uploadFileToS3 = async (
  projectId,
  file,
  compress,
  uploadUrlParams,
  type,
  abortController,
  onStatusUpdate = () => { },
) => {
  const {
    uploadId, bucket, key,
  } = uploadUrlParams;

  if (!uploadId || !bucket || !key) {
    throw new Error('uploadUrlParams must contain uploadId, bucket, and key');
  }

  const partUploadParams = {
    projectId,
    uploadId,
    bucket,
    key,
  };

  let parts;
  try {
    parts = await processMultipartUpload(
      file, compress, partUploadParams, abortController, onStatusUpdate,
    );
  } catch (e) {
    // Return silently, the error is handled in the onStatusUpdate callback
    return;
  }

  try {
    await completeMultipartUpload(parts, uploadId, key, type);

    onStatusUpdate(UploadStatus.UPLOADED);
  } catch (e) {
    onStatusUpdate(UploadStatus.UPLOAD_ERROR);
  }
};

const processMultipartUpload = async (
  file, compress, uploadParams, abortController, onStatusUpdate,
) => {
  const fileUploader = new FileUploader(
    file,
    compress,
    fileUploadConfig.chunkSize,
    uploadParams,
    abortController,
    onStatusUpdate,
  );

  const parts = await fileUploader.upload();

  // S3 expects parts to be sorted by number
  parts.sort(({ PartNumber: PartNumber1 }, { PartNumber: PartNumber2 }) => {
    if (PartNumber1 === PartNumber2) throw new Error('Non-unique partNumbers found, each number should be unique');

    return PartNumber1 > PartNumber2 ? 1 : -1;
  });

  return parts;
};

const completeMultipartUpload = async (parts, uploadId, s3Path, type) => {
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
};

export default uploadFileToS3;
