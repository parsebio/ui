import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import _ from 'lodash';
import initialState from '../../reducers/cellSets/initialState';

const getCellSets = () => (state) => {
  const stateToReturn = (Object.keys(state).length ? state : initialState);

  const accessible = !stateToReturn.loading
    && !stateToReturn.initialLoadPending
    && !stateToReturn.updatingClustering
    && !stateToReturn.error;

  const { properties } = stateToReturn;
  const propertiesWithExtraKeys = {};
  if (!_.isEmpty(properties)) {
    Object.entries(properties).forEach(([key, value]) => {
      propertiesWithExtraKeys[key] = {
        ...value,
        getCellIds: () => {
          const { cellIds, cellSetKeys } = value;
          if (value.rootNode) return new Set();
          if (cellIds) {
            return new Set(cellIds);
          }
          return new Set(cellSetKeys.map((sampleId) => properties[sampleId].cellIds).flat()[0]);
        },
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
