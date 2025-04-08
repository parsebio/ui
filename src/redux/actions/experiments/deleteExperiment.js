import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import {
  EXPERIMENTS_ERROR, EXPERIMENTS_SAVING,
} from 'redux/actionTypes/experiments';

import removeExperiment from './removeExperiment';

const deleteExperiment = (
  experimentId,
) => async (dispatch, getState) => {
  // Delete samples
  dispatch({
    type: EXPERIMENTS_SAVING,
    payload: {
      message: endUserMessages.DELETING_PROJECT,
    },
  });
  try {
    await fetchAPI(
      `/v2/experiments/${experimentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    dispatch(removeExperiment(experimentId));
  } catch (e) {
    const errorMessage = handleError(e, endUserMessages.ERROR_DELETING_PROJECT);

    dispatch({
      type: EXPERIMENTS_ERROR,
      payload: {
        message: errorMessage,
      },
    });
  }
};

export default deleteExperiment;
