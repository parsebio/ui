import {
  CELL_SETS_ERROR, CELL_SETS_CLUSTERING_UPDATING,
} from 'redux/actionTypes/cellSets';

import getTimeoutForWorkerTask from 'utils/getTimeoutForWorkerTask';
import fetchWork from 'utils/work/fetchWork';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';
import updateCellSetsClustering from 'redux/actions/cellSets/updateCellSetsClustering';
import getCellSets from 'redux/selectors/cellSets/getCellSets';

const runCellSetsAnnotation = (
  experimentId, species, tissue, tool,
) => async (dispatch, getState) => {
  const { error, updatingClustering, loading } = getCellSets()(getState().cellSets);

  if ((loading && updatingClustering) || error || experimentId === 'c26b1fc8-e207-4a45-90ae-51b730617bee') return;

  const body = {
    name: tool,
    species,
    tissue,
  };

  dispatch({
    type: CELL_SETS_CLUSTERING_UPDATING,
  });

  const timeout = getTimeoutForWorkerTask(getState(), 'ClusterCells');

  try {
    await fetchWork(
      experimentId,
      body,
      getState,
      dispatch,
      {
        timeout,
        broadcast: true,
      },
    );
  } catch (e) {
    const errorMessage = handleError(e, endUserMessages.ERROR_CELL_SETS_ANNOTATION_FAILED);
    dispatch({
      type: CELL_SETS_ERROR,
      payload: {
        experimentId,
        error: errorMessage,
      },
    });
    // To set the clustering status back to false
    dispatch(updateCellSetsClustering(experimentId));
  }
};

export default runCellSetsAnnotation;
