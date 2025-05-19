import updateSecondaryAnalysisFile from 'redux/actions/secondaryAnalyses/updateSecondaryAnalysisFile';
import createSecondaryAnalysisFile from 'redux/actions/secondaryAnalyses/createSecondaryAnalysisFile';

import UploadStatus from 'utils/upload/UploadStatus';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import UploadsCoordinator from 'utils/upload/UploadsCoordinator';

const uploadSecondaryAnalysisFile = async (
  file,
  secondaryAnalysisId,
  uploadUrlParams,
  dispatch,
  resumeUpload = false,
) => {
  const abortController = new AbortController();

  // before adding compression, make sure uncompressed files are saved with .gz at the end
  // const shouldCompress = await getShouldCompress(file);

  dispatch(updateSecondaryAnalysisFile(
    secondaryAnalysisId,
    uploadUrlParams.fileId,
    UploadStatus.QUEUED,
    { abortController },
  ));

  const onUpdateUploadStatus = (status, percentProgress) => {
    dispatch(updateSecondaryAnalysisFile(
      secondaryAnalysisId,
      uploadUrlParams.fileId,
      status,
      { percentProgress },
    ));
  };

  const options = {
    retryPolicy: 'exponentialBackoff',
    resumeUpload,
    compress: false,
  };

  try {
    await UploadsCoordinator.get().uploadFile(
      [
        secondaryAnalysisId,
        file,
        uploadUrlParams,
        'secondaryAnalysis',
        abortController,
        onUpdateUploadStatus,
        options,
      ],
    );
  } catch (e) {
    onUpdateUploadStatus(UploadStatus.UPLOAD_ERROR);
  }
};

const createAndUploadSecondaryAnalysisFiles = async (
  secondaryAnalysisId,
  filesList,
  handlesList,
  type,
  dispatch,
) => {
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

const resumeUpload = async (secondaryAnalysisId, fileHandle, uploadUrlParams, dispatch) => {
  try {
    const file = await fileHandle.getFile();

    await uploadSecondaryAnalysisFile(file, secondaryAnalysisId, uploadUrlParams, dispatch, true);
  } catch (e) {
    console.trace('Error resuming upload:', e);
    if (e.message.startsWith('PermissionError')) {
      pushNotificationMessage('error', 'Permission to access the file was not granted. Please check the file permissions and try again.');
    } else {
      pushNotificationMessage('error', 'We could not resume the upload of this file. The file might be deleted, renamed or moved to another directory');
    }
  }
};

export { resumeUpload, createAndUploadSecondaryAnalysisFiles };
