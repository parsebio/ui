/* eslint-disable no-param-reassign */
import pushNotificationMessage from 'utils/pushNotificationMessage';
import { SECONDARY_ANALYSIS_FILES_LOADED, SECONDARY_ANALYSIS_FILES_LOADING } from 'redux/actionTypes/secondaryAnalyses';
import fetchAPI from 'utils/http/fetchAPI';
import UploadStatus from 'utils/upload/UploadStatus';
import cache from 'utils/cache';

const loadSecondaryAnalysisFiles = (secondaryAnalysisId) => async (dispatch, getState) => {
  const filesInRedux = getState().secondaryAnalyses[secondaryAnalysisId].files?.data ?? {};

  const {
    PAUSED, DROP_AGAIN, UPLOADING, QUEUED,
  } = UploadStatus;
  try {
    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADING,
      payload: {
        secondaryAnalysisId,
      },
    });

    const files = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`);

    const filesForRedux = await Promise.all(files
      // If it is uploading or queued in redux, then this upload is managed by this client so
      // don't overwrite it
      .filter(
        (file) => ![UPLOADING, QUEUED].includes(filesInRedux[file.id]?.upload?.status.current),
      )
      // If the file upload status is 'uploading' in sql, we need to store something else in redux
      // since that status is not correct if the upload is not performed in this case
      .map(async (file) => {
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
    console.error(e);
    pushNotificationMessage('error', 'We could not load the pipeline files for this run.');
  }
};

export default loadSecondaryAnalysisFiles;
