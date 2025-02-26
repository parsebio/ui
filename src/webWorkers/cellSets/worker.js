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
  console.log('SUPIMHERE');
  const { task, id, payload } = e.data;

  try {
    await handleTask(task, id, payload);
  } catch (error) {
    self.postMessage({
      id, task, payload: null, error,
    });
  }
};

const handleTask = async (task, id, payload) => {
  if (task === 'storeCellSets') {
    await storeCellSets(payload);

    // Notify finished loading cell sets
    self.postMessage({ task: 'storeCellSets' });
  } else if (task === 'cellSetCreated') {
    await cellSetCreated(payload);

    self.postMessage({ id, task: 'cellSetCreated' });
  } else if (task === 'countCells') {
    self.activeIdByTask[task] = id;

    const count = await countCells(payload, id);

    if (self.activeIdByTask.countCells !== id) { return; }

    self.postMessage({ id, task: 'countCells', payload: count });
  }
};

const storeCellSets = async (payload) => {
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
  const { cellSetKeys } = payload;

  const cellSetsArr = cellSetKeys
    .map((key) => self.properties[key])
    .filter(({ rootNode }) => !rootNode);

  const cellsToCount = new Set();

  let itsPerYield = 0;

  // eslint-disable-next-line no-unused-vars
  for (const { cellIds } of cellSetsArr) {
    // eslint-disable-next-line no-unused-vars
    for (const cellId of cellIds) {
      if (self.filteredCellIds.has(cellId)) {
        cellsToCount.add(cellId);

        itsPerYield += 1;
        if (itsPerYield > 100000) {
          itsPerYield = 0;

          yield;

          if (self.activeIdByTask.countCells !== id) {
            return;
          }
        }
      }
    }
  }

  if (self.activeIdByTask.countCells !== id) {
    return;
  }

  return cellsToCount.size;
}

const cellSetCreated = async (payload) => {
  const {
    cellSet: {
      key, name, color, cellIds, type,
    },
  } = payload;

  self.properties[key] = {
    key, name, color, cellIds: new Set(cellIds), type, parentNodeKey: 'scratchpad',
  };
};

const countCells = async (payload, id) => (
  new Promise((resolve) => {
    if (self.activeIdByTask.countCells !== id) {
      resolve(undefined);
    }

    // Cells counting is set up with pauses
    // to allow for an operation to be cancelled when a new counting is requested
    // at the point we receive a new request, we want to drop the current count
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
