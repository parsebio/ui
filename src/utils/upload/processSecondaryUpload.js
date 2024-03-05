import { getShouldCompress } from 'utils/upload/fileInspector';
import uploadFileToS3 from 'utils/upload/multipartUpload';
import { updateSecondaryAnalysisFile, createSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';
import cache from 'utils/cache';
import pushNotificationMessage from 'utils/pushNotificationMessage';

const uploadSecondaryAnalysisFile = async (
  file,
  secondaryAnalysisId,
  uploadUrlParams,
  dispatch,
) => {
  const onUpdateUploadStatus = (status, percentProgress = 0) => {
    dispatch(updateSecondaryAnalysisFile(
      secondaryAnalysisId, uploadUrlParams.fileId, status, percentProgress,
    ));
  };

  const shouldCompress = await getShouldCompress(file);
  onUpdateUploadStatus(UploadStatus.UPLOADING);

  return uploadFileToS3(
    secondaryAnalysisId,
    file,
    false,
    uploadUrlParams,
    'secondaryAnalysis',
    new AbortController(),
    onUpdateUploadStatus,
    'exponentialBackoff',
  );
};

const createAndUploadSecondaryAnalysisFiles = async (
  secondaryAnalysisId, filesList, handlesList = [], type, dispatch) => {
  const uploadUrlParamsList = await Promise.all(
    filesList.map(async (file, index) => {
      const handle = handlesList[index] ?? null;
      return dispatch(createSecondaryAnalysisFile(secondaryAnalysisId, file, type, handle));
    }),
  );

  // Upload files one by one using the corresponding uploadUrlParams
  await uploadUrlParamsList.reduce(async (promiseChain, uploadUrlParams, index) => {
    // Ensure the previous upload is completed
    await promiseChain;
    const file = filesList[index];
    return uploadSecondaryAnalysisFile(file, secondaryAnalysisId, uploadUrlParams, dispatch);
  }, Promise.resolve()); // Start with an initially resolved promise
};
const resumeUpload = async (secondaryAnalysisId, fileId, dispatch) => {
  try {
    const { uploadUrlParams, fileHandle } = await cache.get(fileId);

    // Request permission to access the file
    const permissionStatus = await fileHandle.requestPermission({ mode: 'read' });
    if (permissionStatus !== 'granted') {
      throw new Error('Permission to access the file was not granted');
    }

    const file = await fileHandle.getFile();

    await uploadSecondaryAnalysisFile(
      file, secondaryAnalysisId, { ...uploadUrlParams, resumeUpload: true }, dispatch,
    );
  } catch (e) {
    console.trace('Error resuming upload:', e);
    pushNotificationMessage('error', 'We could not resume the upload of this file. The file might be deleted or moved to another directory');
  }
};

export { resumeUpload, createAndUploadSecondaryAnalysisFiles };
