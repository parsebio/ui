import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import { SECONDARY_ANALYSES_LOADING, SECONDARY_ANALYSES_LOADED, SECONDARY_ANALYSES_ERROR } from 'redux/actionTypes/secondaryAnalyses';

const loadSecondaryAnalyses = () => async (dispatch) => {
  dispatch({
    type: SECONDARY_ANALYSES_LOADING,
  });

  try {
    const secondaryAnalyses = await fetchAPI('/v2/secondaryAnalysis');
    dispatch({
      type: SECONDARY_ANALYSES_LOADED,
      payload: {
        secondaryAnalyses,
      },
    });
  } catch (e) {
    console.error(e);
    const errorMessage = handleError(e, endUserMessages.ERROR_LOADING_PROJECT);

    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};
export default loadSecondaryAnalyses;
