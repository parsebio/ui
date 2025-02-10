const difference = (filteredSet, filteringSet) => {
  const result = new Set(
    [...filteredSet].filter((x) => !filteringSet.has(x)),
  );

  return result;
};

const union = (set1, set2) => {
  const resultSet = new Set();

  set1.forEach((elem) => resultSet.add(elem));
  set2.forEach((elem) => resultSet.add(elem));

  return resultSet;
};

// Uses includes or has depending on if set2 is an Array or a Set
const contains = (container, element) => (
  Array.isArray(container) ? container.includes(element) : container.has(element)
);

const intersection = (set1, set2) => {
  const resultSet = new Set();

  set1.forEach((elem) => {
    if (contains(set2, elem)) {
      resultSet.add(elem);
    }
  });

  return resultSet;
};

const countCells = (cellSetKeys, filteredCellIds, properties) => {
  const cellSetsArr = cellSetKeys.map((key) => properties[key].cellIds);

  const selectedCells = new Set();

  cellSetsArr.forEach((cellSet) => {
    cellSet.forEach((cellId) => {
      if (filteredCellIds.current.has(cellId)) {
        selectedCells.add(cellId);
      }
    });
  });

  return selectedCells.size;
};

export {
  difference, union, contains, intersection, countCells,
};
