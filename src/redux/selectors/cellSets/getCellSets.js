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
      const { cellIds, cellSetKeys } = value;
      let getCellIds = () => new Set();
      if (cellIds) {
        getCellIds = () => new Set(cellIds);
      } else if (cellSetKeys) {
        getCellIds = () => new Set(
          cellSetKeys.map((sampleId) => properties[sampleId].cellIds).flat()[0],
        );
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
