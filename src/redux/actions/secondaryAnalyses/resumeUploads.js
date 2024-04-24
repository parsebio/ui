import { getFastqFiles } from 'redux/selectors';

import cache from 'utils/cache';
import UploadStatus from 'utils/upload/UploadStatus';
import { resumeUpload } from 'utils/upload/processSecondaryUpload';

const resumeUploads = (secondaryAnalysisId) => async (dispatch, getState) => {
  const fastqs = await getFastqFiles(secondaryAnalysisId)(getState());

  const pausedFastqs = Object.values(fastqs).filter(
    (fastq) => [UploadStatus.ERROR, UploadStatus.PAUSED].includes(fastq.upload.status.current),
  );

  const fastqsData = await Promise.all(pausedFastqs.map(
    async (fastq) => {
      const { uploadUrlParams, fileHandle } = await cache.get(fastq.id);

      const options = { mode: 'read' };

      if (await fileHandle.queryPermission(options) === 'granted') {
        return { uploadUrlParams, fileHandle };
      }

      if (await fileHandle.requestPermission(options) === 'granted') {
        return { uploadUrlParams, fileHandle };
      }

      throw new Error('PermissionError: Permission to access the file was not granted');
    },
  ));

  fastqsData.forEach(({ fileHandle, uploadUrlParams }) => {
    resumeUpload(secondaryAnalysisId, fileHandle, uploadUrlParams, dispatch);
  });
};

export default resumeUploads;
