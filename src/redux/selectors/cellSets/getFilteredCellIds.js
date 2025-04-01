import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

import getCellSets from 'redux/selectors/cellSets/getCellSets';
import { unionByCellClass } from 'utils/cellSetOperations';

const getFilteredCellIds = (options = {}) => (state) => {
  const { asSet = false, sorted = true } = options;

  if (!state || !state.accessible) {
    return [];
  }

  const filteredCellIdsSet = unionByCellClass('louvain', state.hierarchy, state.properties);

  if (asSet) {
    return filteredCellIdsSet;
  }

  const filteredCellIds = Array.from(filteredCellIdsSet);

  if (!sorted) {
    return filteredCellIds;
  }

  return filteredCellIds.sort((a, b) => a - b);
};

export default createMemoizedSelector(
  getFilteredCellIds,
  {
    inputSelectors: getCellSets(),
    // Output can be relatively large, so better not to
    // load this onto memory unless a component needs it
    maxCachedKeys: 0,
  },
);
