/* eslint-disable no-restricted-globals */

self.onmessage = (e) => {
  const { selectedCellSetsIdsArr, filteredCellIdsArr } = e.data;
  const filteredCellIds = new Set(filteredCellIdsArr);
  const selectedCells = new Set();

  selectedCellSetsIdsArr.forEach((cellSetIds) => {
    cellSetIds.forEach((cellId) => {
      if (filteredCellIds.has(cellId)) {
        selectedCells.add(cellId);
      }
    });
  });

  self.postMessage(selectedCells.size);
};
