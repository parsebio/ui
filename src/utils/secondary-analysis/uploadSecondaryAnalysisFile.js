import { getShouldCompress } from 'utils/upload/fileInspector';
import uploadFileToS3 from 'utils/upload/multipartUpload';
import { updateSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';

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
export default uploadSecondaryAnalysisFile;
