const getSampleCells = (cellSets, sampleKey) => {
  if (!(sampleKey in cellSets.properties)) {
    return [];
  }

  const cellIds = Array.from(cellSets.properties[sampleKey].getCellIds());

  return cellIds.map((cellId) => ({
    cellId,
    cellSetKey: sampleKey,
  }));
};

export default getSampleCells;
