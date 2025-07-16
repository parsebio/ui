import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';

import {
  SECONDARY_ANALYSES_SAVING, SECONDARY_ANALYSES_UPDATED, SECONDARY_ANALYSES_ERROR,
} from 'redux/actionTypes/secondaryAnalyses';
import endUserMessages from 'utils/endUserMessages';

const updateSecondaryAnalysis = (
  secondaryAnalysisId,
  secondaryAnalysisDiff,
) => async (dispatch) => {
  dispatch({
    type: SECONDARY_ANALYSES_SAVING,
  });

  try {
    await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(secondaryAnalysisDiff),
      },
    );

    dispatch({
      type: SECONDARY_ANALYSES_UPDATED,
      payload: {
        secondaryAnalysisId,
        secondaryAnalysis: secondaryAnalysisDiff,
      },
    });
  } catch (e) {
    console.error(e);
    const errorMessage = handleError(e, endUserMessages.ERROR_SAVING);

    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};

export default updateSecondaryAnalysis;
