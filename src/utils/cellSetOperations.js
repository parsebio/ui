import _ from 'lodash';

import * as setOperations from 'utils/setOperations';

/**
 *
 * @param {*} cellClassKey The key of the cell class we want to unite by, e.g.: 'louvain'
 * @param {*} hierarchy
 * @param {*} properties
 * @returns A Set of all cell ids of the cellClassKey
 */
const unionByCellClass = (cellClassKey, hierarchy, properties) => {
  const cellSetKeys = hierarchy
    .find(({ key }) => key === cellClassKey).children
    .map(({ key }) => key);

  return union(cellSetKeys, properties);
};

const union = (listOfSets, properties) => {
  if (!listOfSets) {
    return new Set();
  }

  const sets = listOfSets.map((key) => properties[key]?.cellIds || []);
  // flatten and transform list of Sets to list of lists
  const unionSet = new Set(
    sets.flatMap((set) => [...set]),
  );

  return unionSet;
};

const intersection = (listOfSets, properties) => {
  if (!listOfSets) {
    return new Set();
  }

  const sets = listOfSets.map(
    (key) => properties[key]?.cellIds || null,
  ).filter(
    (set) => set && set.size > 0,
  );

  if (sets.length === 0) {
    return new Set();
  }

  const intersectionSet = sets.reduce(
    (acc, curr) => new Set([...acc].filter((x) => curr.has(x))),
  );

  return intersectionSet;
};

const complement = (listOfSets, properties, hierarchy) => {
  if (!listOfSets) {
    return new Set();
  }
  // get the ids of all selected cells
  const selectedCells = listOfSets.map(
    (key) => properties[key]?.cellIds || null,
  ).filter(
    (set) => set && set.size > 0,
  ).reduce(
    (acc, curr) => new Set([...acc, ...curr]),
  );

  const complementSet = getFilteredCells({ hierarchy, properties });

  // remove all cells that are selected
  if (selectedCells.size > 0) {
    selectedCells.forEach((x) => { complementSet.delete(x); });
  }

  // return the rest of the cells that are in the dataset and were not selected
  return complementSet;
};

const getFilteredCells = (cellSets) => {
  const louvainClusters = cellSets.hierarchy.find(({ key }) => key === 'louvain').children;
  const louvainClustersCellIds = louvainClusters
    .map(({ key }) => cellSets.properties[key].cellIds);

  const filteredInCellIds = louvainClustersCellIds.reduce(
    (filteredInCellIdsAcum, cellIds) => setOperations.union(filteredInCellIdsAcum, cellIds),
    new Set(),
  );

  return filteredInCellIds;
};

const withoutFilteredOutCells = (cellSets, originalCellIds) => {
  const filteredInCellIds = getFilteredCells(cellSets);

  return setOperations.intersection(filteredInCellIds, originalCellIds);
};

const allLouvain = (cellSetsArr) => cellSetsArr.every(({ parentNodeKey }) => (parentNodeKey === 'louvain'));

const countCells = async (cellSetKeys, filteredCellIds, properties) => {
  const a = 1;

  // Import the worker script
  const selectedCellsCounterWorker = new Worker(
    new URL('../webworkers/selectedCellsCounter.js',
      import.meta.url),
  );

  return new Promise((resolve, reject) => {
    const cellSetsArr = cellSetKeys
      .map((key) => properties[key])
      .filter(({ rootNode }) => !rootNode);

    // If all the cell sets are louvain (always disjoint and filtered), then we don't need to
    // do an expensive count, just return the sum of each individual set's size
    if (allLouvain(cellSetsArr)) {
      return _.sumBy(cellSetsArr, 'cellIds.size');
    }

    selectedCellsCounterWorker.onmessage = (e) => {
      const selectedCellsCount = e.data;
      resolve(selectedCellsCount);
    };

    selectedCellsCounterWorker.onerror = (error) => {
      reject(error);
    };

    const selectedCellSetsIdsArr = cellSetsArr.map(({ cellIds }) => Array.from(cellIds));
    const filteredCellIdsArr = Array.from(filteredCellIds.current);

    selectedCellsCounterWorker.postMessage({
      selectedCellSetsIdsArr, filteredCellIdsArr,
    });
  });
};

export {
  union,
  intersection,
  complement,
  unionByCellClass,
  getFilteredCells,
  withoutFilteredOutCells,
  countCells,
};
