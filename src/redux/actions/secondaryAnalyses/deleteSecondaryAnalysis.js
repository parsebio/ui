import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import {
  SECONDARY_ANALYSES_ERROR,
  SECONDARY_ANALYSES_SAVING,
} from 'redux/actionTypes/secondaryAnalyses';
import removeSecondaryAnalysis from './removeSecondaryAnalysis';

const deleteSecondaryAnalysis = (
  secondaryAnalysisId,
) => async (dispatch) => {
  dispatch({
    type: SECONDARY_ANALYSES_SAVING,
    payload: {
      message: endUserMessages.DELETING_PROJECT,
    },
  });

  try {
    await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    // If deleted project is the same as the active project, choose another project
    dispatch(removeSecondaryAnalysis(secondaryAnalysisId));
  } catch (e) {
    const errorMessage = handleError(e, endUserMessages.ERROR_DELETING_PROJECT);

    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        message: errorMessage,
      },
    });
  }
};

export default deleteSecondaryAnalysis;
