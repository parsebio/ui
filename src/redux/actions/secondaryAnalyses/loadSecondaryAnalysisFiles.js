import pushNotificationMessage from 'utils/pushNotificationMessage';
import { SECONDARY_ANALYSIS_FILES_LOADED } from 'redux/actionTypes/secondaryAnalyses';
import fetchAPI from 'utils/http/fetchAPI';

const loadSecondaryAnalysisFiles = (secondaryAnalysisId) => async (dispatch) => {
  try {
    const response = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`);
    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADED,
      payload: {
        secondaryAnalysisId,
        files: response,
      },
    });
  } catch (e) {
    pushNotificationMessage('error', 'We could not load the secondary analysis files for this run.');
    console.log(e);
  }
};

export default loadSecondaryAnalysisFiles;
