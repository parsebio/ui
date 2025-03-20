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
          // a sample under that id might not exist, but still have the sampleuuid
          // in the cellsetkeys (e.g. the experiment was subsetted)
          if (properties[sampleId]?.cellIds) {
            cellIdsToReturn.addSet(properties[sampleId].cellIds, true);
          }
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
