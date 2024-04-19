import { getFastqFiles } from 'redux/selectors';

import UploadStatus from 'utils/upload/UploadStatus';
import { resumeUpload } from 'utils/upload/processSecondaryUpload';

const resumeUploads = (secondaryAnalysisId) => async (dispatch, getState) => {
  const fastqs = await getFastqFiles(secondaryAnalysisId)(getState());

  const pausedFastqs = Object.values(fastqs).filter(
    (fastq) => fastq.upload.status.current === UploadStatus.PAUSED,
  );

  console.log('pausedFastqsDebug');
  console.log(pausedFastqs);

  pausedFastqs.forEach((fastq) => {
    resumeUpload(secondaryAnalysisId, fastq.id, dispatch);
  });
};

export default resumeUploads;
