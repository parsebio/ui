import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import _ from 'lodash';
import LazySet from 'utils/cellSets/LazySet';
import initialState from '../../reducers/cellSets/initialState';

const getCellSets = () => (state) => {
  const stateToReturn = (state && Object.keys(state).length ? state : initialState);

  const accessible = !stateToReturn.loading
    && !stateToReturn.initialLoadPending
    && !stateToReturn.updatingClustering
    && !stateToReturn.error;

  const { properties } = stateToReturn;
  const propertiesWithExtraKeys = {};

  let cellIdsToReturn;

  if (!_.isEmpty(properties)) {
    Object.entries(properties).forEach(([key, value]) => {
      const { cellIds, cellSetKeys } = value;

      if (cellIds) {
        cellIdsToReturn = new LazySet(cellIds);
      } else if (cellSetKeys) {
        cellIdsToReturn = new LazySet();

        cellSetKeys.forEach((sampleId) => {
          cellIdsToReturn.addSet(properties[sampleId].cellIds);
        });
      } else {
        cellIdsToReturn = new LazySet();
      }

      propertiesWithExtraKeys[key] = {
        ...value,
        cellIds: cellIdsToReturn,
      };
    });
  }

  return {
    ...stateToReturn,
    properties: propertiesWithExtraKeys,
    accessible,
  };
};

export default createMemoizedSelector(getCellSets);
