import LazySet from './cellSets/LazySet';

const addLazySets = (properties, propertiesWithExtraKeys) => {
  Object.entries(properties).forEach(([key, value]) => {
    const { cellIds, cellSetKeys } = value;

    let cellIdsToReturn;

    if (cellIds) {
      cellIdsToReturn = new LazySet(cellIds);
    } else if (cellSetKeys) {
      cellIdsToReturn = new LazySet();

      cellSetKeys.forEach((sampleId) => {
        cellIdsToReturn.addSet(properties[sampleId].cellIds, true);
      });
    } else {
      cellIdsToReturn = new LazySet();
    }

    // eslint-disable-next-line no-param-reassign
    propertiesWithExtraKeys[key] = {
      ...value,
      cellIds: cellIdsToReturn,
    };
  });
};

export default addLazySets;
