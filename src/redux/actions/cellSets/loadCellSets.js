// eslint-disable-next-line camelcase
import { JSON_parse } from 'uint8array-json-parser';

import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import {
  CELL_SETS_LOADED, CELL_SETS_LOADING, CELL_SETS_ERROR,
} from 'redux/actionTypes/cellSets';
import endUserMessages from 'utils/endUserMessages';
import { downloadFromS3 } from 'utils/work/downloadFromS3AndParse';
import getCellSets from 'redux/selectors/cellSets/getCellSets';

import CellSetsWorker from 'webworkers/cellSets/CellSetsWorker';

const downloadAndParse = async (signedUrl) => {
  const storageResp = await downloadFromS3(signedUrl);

  const arrayBuffer = await storageResp.arrayBuffer();

  // We need to parse before sending the arrayBuffer to the webworker
  // Because when transferring it to the webworker
  // Main thread will lose access to it
  const { cellSets } = JSON_parse(new Uint8Array(arrayBuffer));

  const webWorkerPromise = CellSetsWorker.getInstance().storeCellSets(arrayBuffer);

  return { cellSets, webWorkerPromise };
};

const loadCellSets = (experimentId, forceReload = false) => async (dispatch, getState) => {
  const {
    loading, error, updatingClustering, initialLoadPending,
  } = getCellSets()(getState().cellSets);

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

    const { cellSets, webWorkerPromise } = await downloadAndParse(signedUrl);

    dispatch({
      type: CELL_SETS_LOADED,
      payload: {
        experimentId,
        data: cellSets,
      },
    });

    await webWorkerPromise;
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
