import fetchAPI from 'utils/http/fetchAPI';
import { SECONDARY_ANALYSIS_STATUS_LOADED, SECONDARY_ANALYSES_ERROR } from 'redux/actionTypes/secondaryAnalyses';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

const cancelSecondaryAnalysis = (secondaryAnalysisId) => async (dispatch) => {
  try {
    await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/cancel`, {
      method: 'POST',
    });

    dispatch({
      type: SECONDARY_ANALYSIS_STATUS_LOADED,
      payload: { secondaryAnalysisId, status: { current: 'cancelled' } },
    });
  } catch (e) {
    console.error(e);
    const errorMessage = handleError(e, endUserMessages.ERROR_CANCELLING_SECONDARY_ANALYSIS);
    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: { error: errorMessage },
    });
  }
};

export default cancelSecondaryAnalysis;
