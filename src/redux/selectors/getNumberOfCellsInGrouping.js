import _ from 'lodash';

const getNumberOfCellsInGrouping = (rootNodeKey, cellSets) => {
  const { hierarchy, properties } = cellSets;

  const rootNode = hierarchy.find(({ key }) => key === rootNodeKey);

  if (!rootNode) return null;

  const cellSetsLengths = rootNode?.children.map(
    ({ key: cellSetKey }) => properties[cellSetKey].cellIds.size,
  );

  return _.sum(cellSetsLengths);
};

export default getNumberOfCellsInGrouping;
