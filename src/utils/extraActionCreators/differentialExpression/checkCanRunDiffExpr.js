import _ from 'lodash';

import { ComparisonType } from 'components/data-exploration/differential-expression-tool/DiffExprCompute';

const MIN_NUM_CELLS_IN_GROUP = 10;
const NUM_SAMPLES_SHOW_ERROR = 1;
const NUM_SAMPLES_SHOW_WARNING = 2;

const mapCellIdToSample = _.memoize(
  (sampleKeys, properties) => {
    const mapping = [];
    sampleKeys.forEach((key, idx) => {
      const cellIds = properties[key].getCellIds();
      cellIds.forEach((cellId) => { mapping[cellId] = idx; });
    });

    return mapping;
  },
  (sampleKeys) => sampleKeys.length,
);

const getSampleKeys = (hierarchy) => hierarchy?.find(
  (rootNode) => (rootNode.key === 'sample'),
)?.children.map((sample) => sample.key);

const checkCanRunDiffExpr = (
  properties,
  hierarchy,
  comparisonGroup,
  selectedComparison,
) => {
  // we only need to check cell availability for comparisons which are not 'within'
  if (selectedComparison === ComparisonType.WITHIN) {
    return canRunDiffExprResults.TRUE;
  }

  const { basis, cellSet, compareWith } = comparisonGroup?.[selectedComparison] || {};

  const sampleKeys = getSampleKeys(hierarchy);
  const cellIdToSampleMap = mapCellIdToSample(sampleKeys, properties);

  if (!basis
    || !cellSet
    || !compareWith
    || !cellIdToSampleMap.length > 0
  ) {
    return canRunDiffExprResults.FALSE;
  }

  let basisCellIds = [];
  if (basis === 'all') {
    const allCellIds = sampleKeys.reduce((cumulativeCellIds, key) => {
      const cellIds = properties[key].getCellIds();
      return cumulativeCellIds.concat(Array.from(cellIds));
    }, []);
    basisCellIds = new Set(allCellIds);
  } else {
    basisCellIds = properties[basis].getCellIds();
  }

  const cellSetCellIds = Array.from(properties[cellSet].getCellIds());

  let compareWithCellIds = [];
  if (['rest', 'background'].includes(compareWith)) {
    const otherGroupKeys = hierarchy.find((obj) => obj.key === properties[cellSet]?.parentNodeKey)
      .children.filter((child) => child.key !== cellSet);

    compareWithCellIds = otherGroupKeys.reduce(
      (cumulativeGroupKeys, child) => cumulativeGroupKeys.concat(
        Array.from(properties[child.key].cellIds),
      ), [],
    );
  } else {
    compareWithCellIds = Array.from(properties[compareWith].getCellIds());
  }

  // Intersect the basis cell set with each group cell set
  const filteredCellSetCellIds = cellSetCellIds.filter((cellId) => basisCellIds.has(cellId));
  const filteredCompareWithCellIds = compareWithCellIds.filter(
    (cellId) => basisCellIds.has(cellId),
  );

  const numSampleWithEnoughCells = (filteredCellSet) => {
    // Prepare an array of length sampleIds to hold the number of cells for each sample
    const numCellsPerSampleInCellSet = new Array(sampleKeys.length).fill(0);

    // Count the number of cells in each sample and assign them into numCellsPerSampleInCellSet
    filteredCellSet
      .forEach((cellId) => {
        const sampleIdx = cellIdToSampleMap[cellId];
        numCellsPerSampleInCellSet[sampleIdx] += 1;
      });

    return numCellsPerSampleInCellSet.filter(
      (numCells) => numCells >= MIN_NUM_CELLS_IN_GROUP,
    ).length;
  };

  const numCellSetSampleWithEnoughCells = numSampleWithEnoughCells(filteredCellSetCellIds);
  const numCompareWithSampleWithEnoughCells = numSampleWithEnoughCells(filteredCompareWithCellIds);

  if (
    numCellSetSampleWithEnoughCells === 0
    || numCompareWithSampleWithEnoughCells === 0
  ) return canRunDiffExprResults.INSUFFCIENT_CELLS_ERROR;

  const sumComparedSamples = numCellSetSampleWithEnoughCells + numCompareWithSampleWithEnoughCells;

  if (
    sumComparedSamples <= NUM_SAMPLES_SHOW_ERROR
  ) return canRunDiffExprResults.INSUFFCIENT_CELLS_ERROR;
  if (
    sumComparedSamples <= NUM_SAMPLES_SHOW_WARNING
  ) return canRunDiffExprResults.INSUFFICIENT_CELLS_WARNING;

  return canRunDiffExprResults.TRUE;
};

const canRunDiffExprResults = {
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  INSUFFICIENT_CELLS_WARNING: 'INSUFFICIENT_CELLS_WARNING',
  INSUFFCIENT_CELLS_ERROR: 'INSUFFCIENT_CELLS_ERROR',
};

export default checkCanRunDiffExpr;
export { canRunDiffExprResults };
