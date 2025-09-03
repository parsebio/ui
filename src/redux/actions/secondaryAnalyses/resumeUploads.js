import { getFastqFiles } from 'redux/selectors';

import cache from 'utils/cache';
import UploadStatus from 'utils/upload/UploadStatus';
import { resumeUpload } from 'utils/upload/processSecondaryUpload';

const resumeUploads = (secondaryAnalysisId) => async (dispatch, getState) => {
  const fastqs = await getFastqFiles(secondaryAnalysisId)(getState());

  const fastqsData = await Promise.all(Object.values(fastqs).map(
    async (fastq) => {
      const cachedData = await cache.get(fastq.id);

      if (cachedData === null) return;

      const { uploadUrlParams, fileHandle } = cachedData;

      const options = { mode: 'read' };

      if (await fileHandle.queryPermission(options) === 'granted') {
        return { uploadUrlParams, fileHandle, uploadStatus: fastq.upload.status.current };
      }

      if (await fileHandle.requestPermission(options) === 'granted') {
        return { uploadUrlParams, fileHandle, uploadStatus: fastq.upload.status.current };
      }

      throw new Error('PermissionError: Permission to access the file was not granted');
    },
  ));

  const pausedFastqsData = fastqsData.filter((fastqData) => (
    [UploadStatus.UPLOAD_ERROR, UploadStatus.PAUSED].includes(fastqData.uploadStatus)
  ));

  pausedFastqsData.forEach(({ fileHandle, uploadUrlParams }) => {
    resumeUpload(secondaryAnalysisId, fileHandle, uploadUrlParams, dispatch);
  });
};

export default resumeUploads;
