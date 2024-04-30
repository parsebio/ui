import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import {
  SECONDARY_ANALYSIS_STATUS_LOADED, SECONDARY_ANALYSIS_STATUS_LOADING,
  SECONDARY_ANALYSES_ERROR,
} from 'redux/actionTypes/secondaryAnalyses';

const loadSecondaryAnalysisStatus = (secondaryAnalysisId) => async (dispatch) => {
  dispatch({
    type: SECONDARY_ANALYSIS_STATUS_LOADING,
    payload: { secondaryAnalysisId },
  });

  try {
    const status = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/executionStatus`);
    let logData = {};
    if (status === 'running' || status === 'failed') {
      logData = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/logs`);
    }

    dispatch({
      type: SECONDARY_ANALYSIS_STATUS_LOADED,
      payload: {
        secondaryAnalysisId,
        status,
        logData,
      },
    });
  } catch (e) {
    const errorMessage = handleError(e, endUserMessages.ERROR_LOADING_PROJECT);

    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};
export default loadSecondaryAnalysisStatus;
