import { getShouldCompress } from 'utils/upload/fileInspector';
import uploadFileToS3 from 'utils/upload/multipartUpload';
import { updateSecondaryAnalysisFile, createSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';
import cache from 'utils/cache';

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
    shouldCompress,
    uploadUrlParams,
    'secondaryAnalysis',
    new AbortController(),
    onUpdateUploadStatus,
    'exponentialBackoff',
  );
};

const createAndUploadSecondaryAnalysisFiles = async (
  secondaryAnalysisId, filesList, type, dispatch) => {
  const uploadUrlParamsList = await Promise.all(
    filesList.map((file) => dispatch(createSecondaryAnalysisFile(secondaryAnalysisId, file, type))),
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
  const cachedFile = await cache.get(fileId);
  const { file, uploadUrlParams } = cachedFile;
  await uploadSecondaryAnalysisFile(
    file, secondaryAnalysisId, { ...uploadUrlParams, resumeUpload: true }, dispatch,
  );
};

export { resumeUpload, createAndUploadSecondaryAnalysisFiles };
