/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */

// eslint-disable-next-line camelcase
import { JSON_parse } from 'uint8array-json-parser';

import { createPropertiesFromTree } from 'redux/reducers/cellSets/helpers';
import addLazySets from 'utils/addLazySets';

self.properties = null;
self.filteredCellIds = null;

self.activeIdByTask = {
  countCells: null,
};

self.onmessage = async (e) => {
  const { task, id, payload } = e.data;

  if (e.data.task === 'loadCellSets') {
    loadCellSets(payload);

    // Notify finished loading cell sets
    self.postMessage({ task: 'loadCellSets' });
  } else if (task === 'countCells') {
    self.activeIdByTask[task] = id;

    const count = await countCells(payload, id);

    if (self.activeIdByTask.countCells !== id) { return; }

    self.postMessage({ id, task: 'countCells', payload: count });
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

function* countCellsGenerator(payload, id) {
  console.time('countingCells');
  const { cellSetKeys } = payload;

  const cellSetsArr = cellSetKeys
    .map((key) => self.properties[key])
    .filter(({ rootNode }) => !rootNode);

  const cellsToCount = new Set();

  let itsPerYield = 0;

  for (const { cellIds } of cellSetsArr) {
    for (const cellId of cellIds) {
      if (self.filteredCellIds.has(cellId)) {
        cellsToCount.add(cellId);

        itsPerYield += 1;
        if (itsPerYield > 100000) {
          console.log('Yielding');
          itsPerYield = 0;

          yield;

          if (self.activeIdByTask.countCells !== id) {
            return;
          }
        }
      }
    }
  }

  console.log('cellsToCountsizeDebug');
  console.log(cellsToCount.size);

  console.timeEnd('countingCells');

  if (self.activeIdByTask.countCells !== id) {
    return;
  }

  return cellsToCount.size;
}

const countCells = async (payload, id) => (
  new Promise((resolve) => {
    if (self.activeIdByTask.countCells !== id) {
      return;
    }

    const generator = countCellsGenerator(payload, id);

    function step() {
      const result = generator.next();

      if (result.done) {
        resolve(result.value);
      } else {
        // Schedule the next step to run in the next event loop iteration
        setTimeout(step, 0);
      }
    }

    step();
  })
);
