import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import _ from 'lodash';
import initialState from '../../reducers/cellSets/initialState';

const getCellSets = () => (state) => {
  const stateToReturn = (state && Object.keys(state).length ? state : initialState);

  const accessible = !stateToReturn.loading
    && !stateToReturn.initialLoadPending
    && !stateToReturn.updatingClustering
    && !stateToReturn.error;

  const { properties } = stateToReturn;
  const propertiesWithExtraKeys = {};
  if (!_.isEmpty(properties)) {
    Object.entries(properties).forEach(([key, value]) => {
      const { cellIds, cellSetKeys } = value;
      let getCellIds = () => new Set();
      if (cellIds) {
        getCellIds = () => new Set(cellIds);
      } else if (cellSetKeys) {
        getCellIds = () => {
          const sets = cellSetKeys.reduce((acc, sampleId) => new Set(
            [...acc, ...properties[sampleId].cellIds],
          ), new Set());
          return sets;
        };
      }
      propertiesWithExtraKeys[key] = {
        ...value,
        getCellIds,
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
