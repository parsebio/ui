/* eslint-disable no-restricted-globals */

// eslint-disable-next-line camelcase
import { JSON_parse } from 'uint8array-json-parser';

import { createPropertiesFromTree } from 'redux/reducers/cellSets/helpers';
import addLazySets from 'utils/addLazySets';

self.properties = null;
self.filteredCellIds = null;

self.onmessage = (e) => {
  if (e.data.task === 'loadCellSets') {
    loadCellSets(e.data.payload);

    // Notify finished loading cell sets
    self.postMessage({ task: 'loadCellSets' });
  } else if (e.data.task === 'countCells') {
    const count = countCells(e.data.payload);

    self.postMessage({ id: e.data.id, task: 'countCells', payload: count });
  }
};

const loadCellSets = async (payload) => {
  const { cellSetsData } = payload;

  const { cellSets } = JSON_parse(new Uint8Array(cellSetsData));

  // Join all louvain cellIds and store them in self.filteredCellIds
  const louvainCellIds = new Set();

  cellSets.forEach((cellSet) => {
    if (cellSet.key === 'louvain') {
      cellSet.children.forEach((cluster) => {
        cluster.cellIds.forEach((cellId) => {
          louvainCellIds.add(cellId);
        });
      });
    }
  });

  self.properties = createPropertiesFromTree(cellSets);
  addLazySets(self.properties, self.properties);

  self.filteredCellIds = louvainCellIds;
};

const countCells = (payload) => {
  console.time('countingCells');
  const { cellSetKeys } = payload;

  console.log('cellSetKeysDebug');
  console.log(cellSetKeys);

  const cellSetsArr = cellSetKeys
    .map((key) => self.properties[key])
    .filter(({ rootNode }) => !rootNode);

  const cellsToCount = new Set();

  cellSetsArr.forEach(({ cellIds }) => {
    cellIds.forEach((cellId) => {
      if (self.filteredCellIds.has(cellId)) {
        cellsToCount.add(cellId);
      }
    });
  });

  console.log('cellsToCountsizeDebug');
  console.log(cellsToCount.size);

  console.timeEnd('countingCells');

  return cellsToCount.size;
};
