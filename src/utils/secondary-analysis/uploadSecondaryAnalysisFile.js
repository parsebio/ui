import { shouldCompress } from 'utils/upload/fileInspector';
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

  const shouldCompressResponse = await shouldCompress(file);
  return uploadFileToS3(
    secondaryAnalysisId,
    file,
    shouldCompressResponse,
    uploadUrlParams,
    'secondaryAnalysis',
    new AbortController(),
    onUpdateUploadStatus,
    'exponentialBackoff',
  );
};
export default uploadSecondaryAnalysisFile;
