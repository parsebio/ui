import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import {
  EXPERIMENTS_SET_ACTIVE, EXPERIMENTS_DELETED, EXPERIMENTS_ERROR, EXPERIMENTS_SAVING,
} from 'redux/actionTypes/experiments';

import { SAMPLES_DELETE } from 'redux/actionTypes/samples';

const deleteExperiment = (
  experimentId, deleteFromReduxOnly = false,
) => async (dispatch, getState) => {
  // Delete samples
  const { experiments } = getState();
  const { activeExperimentId } = experiments.meta;

  try {
    if (!deleteFromReduxOnly) {
      dispatch({
        type: EXPERIMENTS_SAVING,
        payload: {
          message: endUserMessages.DELETING_PROJECT,
        },
      });
      await fetchAPI(
        `/v2/experiments/${experimentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // If deleted project is the same as the active project, choose another project
    if (experimentId === activeExperimentId) {
      const leftoverProjectIds = experiments.ids.filter((uuid) => uuid !== activeExperimentId);

      dispatch({
        type: EXPERIMENTS_SET_ACTIVE,
        payload: { experimentId: leftoverProjectIds.length ? leftoverProjectIds[0] : null },
      });
    }

    dispatch({
      type: SAMPLES_DELETE,
      payload: {
        experimentId,
        sampleIds: experiments[experimentId].sampleIds,
      },
    });

    dispatch({
      type: EXPERIMENTS_DELETED,
      payload: {
        experimentIds: [experimentId],
      },
    });
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
