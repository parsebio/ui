import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import _, { sample } from 'lodash';
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
  let cellsFiltered = false;

  if (!_.isEmpty(properties)) {
    console.log('get cell sets properties  ', properties, stateToReturn);

    const getTotalCellIds = (clusters) => clusters
      .reduce((acc, cluster) => acc + properties[cluster.key].cellIds.size, 0);

    const getClustersByKey = (key) => stateToReturn.hierarchy
      .find((node) => node.key === key).children;

    const sampleClusters = getClustersByKey('sample');
    const louvainClusters = getClustersByKey('louvain');
    const totalSampleCellIds = getTotalCellIds(sampleClusters);
    const totalLouvainCellIds = getTotalCellIds(louvainClusters);
    cellsFiltered = totalSampleCellIds === totalLouvainCellIds;

    console.log('cellsFiltered  ', cellsFiltered);
    console.log('totalSampleCellIds  ', totalSampleCellIds);
    console.log('totalLouvainCellIds  ', totalLouvainCellIds);

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
    cellsFiltered,
  };
};

export default createMemoizedSelector(getCellSets);
