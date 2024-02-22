import pushNotificationMessage from 'utils/pushNotificationMessage';

const uploadSecondaryAnalysisFile = (secondaryAnalysisId, name, size, type) => async (dispatch) => {
  try {
    const uploadUrlParams = await fetch(`v2/secondary-analyses/${secondaryAnalysisId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, size, type }),
    });
    console.log('RECEIVED UPLOAD URL PARAMS ', uploadUrlParams);

    const onUpdateUploadStatus = (status, percentProgress = 0) => {
      dispatch(updateSecondaryAnalysisFile(secondaryAnalysisId, status, percentProgress));
    };

    // compress here?
    // if (!file.fileObject) {
    //   file.fileObject = await loadAndCompressIfNecessary(
    //     file, () => onUpdateUploadStatus(UploadStatus.COMPRESSING),
    //   );
    // }

    // call prepareanduploadtos3 function here
    // await prepareAndUploadFileToS3(file, uploadUrlParams, 'cellLevelMeta', new AbortController(), onUpdateUploadStatus);
  } catch (e) {
    pushNotificationMessage('error', 'Something went wrong while uploading your file.');
    console.log(e);
  }
};
export default uploadSecondaryAnalysisFile;
