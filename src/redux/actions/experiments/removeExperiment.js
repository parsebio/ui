import {
  EXPERIMENTS_SET_ACTIVE, EXPERIMENTS_DELETED,
} from 'redux/actionTypes/experiments';
import { SAMPLES_DELETE } from 'redux/actionTypes/samples';

const removeExperiment = (experimentId) => (dispatch, getState) => {
  // If deleted project is the same as the active project, choose another project
  const { experiments } = getState();
  const { activeExperimentId } = experiments.meta;

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
};

export default removeExperiment;
