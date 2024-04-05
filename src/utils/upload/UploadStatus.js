const UploadStatus = {
  UPLOADED: 'uploaded',
  UPLOADING: 'uploading',
  UPLOADING_FROM_CLI: 'uploadingFromCli',
  COMPRESSING: 'compressing',
  UPLOAD_ERROR: 'uploadError',
  FILE_NOT_FOUND: 'fileNotFound',
  FILE_READ_ERROR: 'fileReadError',
  FILE_READ_ABORTED: 'fileReadAborted',
  QUEUED: 'queued',
  DROP_AGAIN: 'dropAgain',
  UPLOAD_PAUSED: 'resumeUpload',
};

const message = {
  [UploadStatus.UPLOADED]: 'Uploaded',
  [UploadStatus.UPLOADING]: 'Uploading...',
  [UploadStatus.UPLOADING_FROM_CLI]: 'Uploading from console...',
  [UploadStatus.COMPRESSING]: 'Compressing...',
  [UploadStatus.UPLOAD_ERROR]: 'Upload error',
  [UploadStatus.FILE_NOT_FOUND]: 'File not found',
  [UploadStatus.FILE_READ_ERROR]: 'File read error',
  [UploadStatus.FILE_READ_ABORTED]: 'File read aborted',
  [UploadStatus.QUEUED]: 'Queued',
  [UploadStatus.DROP_AGAIN]: 'Drop file again',
  [UploadStatus.UPLOAD_PAUSED]: 'Upload paused',
};

const messageForStatus = (uploadStatus) => message[uploadStatus];

export { messageForStatus };
export default UploadStatus;
