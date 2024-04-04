/* eslint-disable no-param-reassign */
import pushNotificationMessage from 'utils/pushNotificationMessage';
import { SECONDARY_ANALYSIS_FILES_LOADED, SECONDARY_ANALYSIS_FILES_LOADING } from 'redux/actionTypes/secondaryAnalyses';
import fetchAPI from 'utils/http/fetchAPI';
import UploadStatus from 'utils/upload/UploadStatus';
import cache from 'utils/cache';

const loadSecondaryAnalysisFiles = (secondaryAnalysisId) => async (dispatch, getState) => {
  const filesInRedux = getState().secondaryAnalyses[secondaryAnalysisId].files?.data ?? {};

  const { PAUSED, DROP_AGAIN, UPLOADING } = UploadStatus;
  try {
    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADING,
      payload: {
        secondaryAnalysisId,
      },
    });
    const files = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`);

    // If the file upload status is 'uploading' in sql, we need to change it
    // since that status is not correct anymore after a page refresh
    const filesForRedux = await Promise.all(files
      // If we already have a status in redux and it's uploading, then we
      // are performing the upload, so don't update this one
      .filter((file) => filesInRedux[file.id]?.upload?.status.current !== UPLOADING)
      .map(async (file) => {
        const statusInRedux = filesInRedux[file.id]?.upload?.status;
        if (statusInRedux === UPLOADING) return;

        if (file.upload.status === UPLOADING) {
          const isFileInCache = await cache.get(file.id);

          file.upload.status = isFileInCache ? PAUSED : DROP_AGAIN;
        }
        return file;
      }));

    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADED,
      payload: {
        secondaryAnalysisId,
        files: filesForRedux,
      },
    });
  } catch (e) {
    pushNotificationMessage('error', 'We could not load the pipeline files for this run.');
    console.log(e);
  }
};

export default loadSecondaryAnalysisFiles;
