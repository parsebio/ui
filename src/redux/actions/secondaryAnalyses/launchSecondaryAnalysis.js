import fetchAPI from 'utils/http/fetchAPI';
import { SECONDARY_ANALYSIS_STATUS_LOADED } from 'redux/actionTypes/secondaryAnalyses';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

const launchSecondaryAnalysis = (secondaryAnalysisId) => async (dispatch) => {
  try {
    dispatch({
      type: SECONDARY_ANALYSIS_STATUS_LOADED,
      payload: {
        secondaryAnalysisId,
        status: 'created',
      },
    });

    await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/launch`, {
      method: 'POST',
    });
  } catch (error) {
    if (error.statusCode === 422) {
      handleError(error, endUserMessages.ERROR_FASTQS_INCORRECTLY_PAIRED);
    } else {
      handleError(error, endUserMessages.ERROR_LAUNCHING_SECONDARY_ANALYSIS);
    }

    dispatch({
      type: SECONDARY_ANALYSIS_STATUS_LOADED,
      payload: {
        secondaryAnalysisId,
        status: { current: 'failed' },
      },
    });

    throw error;
  }
};

export default launchSecondaryAnalysis;
