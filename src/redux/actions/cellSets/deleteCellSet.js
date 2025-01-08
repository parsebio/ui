import { CELL_SETS_DELETE } from 'redux/actionTypes/cellSets';

import endUserMessages from 'utils/endUserMessages';
import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import getCellSets from 'redux/selectors/cellSets/getCellSets';

const deleteCellSetJsonMerger = (cellSetKey, cellClasskey) => (
  [{
    $match: {
      query: `$[?(@.key == "${cellClasskey}")]`,
      value: {
        children: [
          {
            $match: {
              query: `$[?(@.key == "${cellSetKey}")]`,
              value: {
                $remove: true,
              },
            },
          },
        ],
      },
    },
  }]
);

const deleteCellSet = (experimentId, key) => async (dispatch, getState) => {
  const {
    loading, error,
  } = getCellSets()(getState().cellSets);

  if (loading || error) {
    return null;
  }

  try {
    await fetchAPI(
      `/v2/experiments/${experimentId}/cellSets`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/boschni-json-merger+json',
        },
        body: JSON.stringify(
          deleteCellSetJsonMerger(key, 'scratchpad'),
        ),
      },
    );

    await dispatch({
      type: CELL_SETS_DELETE,
      payload: { key },
    });
  } catch (e) {
    handleError(e, endUserMessages.ERROR_SAVING);
  }
};

export default deleteCellSet;
