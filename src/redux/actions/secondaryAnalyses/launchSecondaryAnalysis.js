import fetchAPI from 'utils/http/fetchAPI';
import { SECONDARY_ANALYSES_LAUNCHED, SECONDARY_ANALYSES_ERROR } from 'redux/actionTypes/secondaryAnalyses';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

const launchSecondaryAnalysis = (secondaryAnalysisId) => async (dispatch) => {
  try {
    const response = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/launch`, {
      method: 'POST',
    });

    dispatch({
      type: SECONDARY_ANALYSES_LAUNCHED,
      payload: response,
    });
  } catch (error) {
    const errorMessage = handleError(error, endUserMessages.ERROR_LAUNCHING_SECONDARY_ANALYSIS);
    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: { error: errorMessage },
    });

    throw error;
  }
};

export default launchSecondaryAnalysis;
