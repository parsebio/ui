import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import {
  CELL_SETS_LOADED, CELL_SETS_LOADING, CELL_SETS_ERROR,
} from 'redux/actionTypes/cellSets';
import endUserMessages from 'utils/endUserMessages';
import downloadFromS3 from 'utils/work/downloadFromS3';

const loadCellSets = (experimentId, forceReload = false) => async (dispatch, getState) => {
  const {
    loading, error, updatingClustering, initialLoadPending,
  } = getState().cellSets;

  const loadingBlocked = loading || updatingClustering;
  const requiresLoading = initialLoadPending || error;

  const shouldLoad = requiresLoading && !loadingBlocked;

  if (!shouldLoad && !forceReload) {
    return;
  }

  dispatch({
    type: CELL_SETS_LOADING,
  });

  try {
    const signedUrl = await fetchAPI(`/v2/experiments/${experimentId}/cellSets`);

    const cellSetsData = await downloadFromS3('CellSets', signedUrl);

    dispatch({
      type: CELL_SETS_LOADED,
      payload: {
        experimentId,
        data: cellSetsData.cellSets,
      },
    });
  } catch (e) {
    const errorMessage = handleError(e, endUserMessages.ERROR_FETCHING_CELL_SETS);
    console.error(e);
    dispatch({
      type: CELL_SETS_ERROR,
      payload: { error: errorMessage },
    });
  }
};

export default loadCellSets;
