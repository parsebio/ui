/* eslint-disable no-param-reassign */
import pushNotificationMessage from 'utils/pushNotificationMessage';
import { SECONDARY_ANALYSIS_FILES_LOADED, SECONDARY_ANALYSIS_FILES_LOADING } from 'redux/actionTypes/secondaryAnalyses';
import fetchAPI from 'utils/http/fetchAPI';
import UploadStatus from 'utils/upload/UploadStatus';
import cache from 'utils/cache';

const loadSecondaryAnalysisFiles = (secondaryAnalysisId) => async (dispatch) => {
  const { UPLOAD_PAUSED, DROP_AGAIN, UPLOADING } = UploadStatus;
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
    const filesForUI = await Promise.all(files.map(async (file) => {
      if (file.upload.status === UPLOADING) {
        const isFileInCache = await cache.get(file.id);
        file.upload.status = isFileInCache ? UPLOAD_PAUSED : DROP_AGAIN;
      }
      return file;
    }));

    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADED,
      payload: {
        secondaryAnalysisId,
        files: filesForUI,
      },
    });
  } catch (e) {
    pushNotificationMessage('error', 'We could not load the secondary analysis files for this run.');
    console.log(e);
  }
};

export default loadSecondaryAnalysisFiles;
