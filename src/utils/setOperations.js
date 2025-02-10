import _ from 'lodash';

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

const allDisjoint = (cellSetsArr) => {
  const firstParentNodeKey = cellSetsArr[0]?.parentNodeKey ?? null;
  const sameClass = cellSetsArr.every(({ parentNodeKey }) => parentNodeKey === firstParentNodeKey);

  return sameClass && firstParentNodeKey !== 'scratchpad';
};

const allFiltered = (cellSetsArr, properties) => (
  cellSetsArr.every(({ parentNodeKey }) => (
    properties[parentNodeKey].type !== 'metadataCategorical'
  ))
);

const countCells = (cellSetKeys, filteredCellIds, properties) => {
  const cellSetsArr = cellSetKeys
    .map((key) => properties[key])
    .filter(({ rootNode }) => !rootNode);

  // If all the cell sets are disjoint and filtered, then we don't need to do an expensive count,
  // Just return the sum of each individual set's size
  if (allDisjoint(cellSetsArr) && allFiltered(cellSetsArr, properties)) {
    console.log('droihrtoij');
    return _.sumBy(cellSetsArr, 'cellIds.size');
  }

  const selectedCells = new Set();

  cellSetsArr.forEach((cellSet) => {
    cellSet.cellIds.forEach((cellId) => {
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
