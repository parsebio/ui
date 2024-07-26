const generateDiffExprBody = (experimentId, comparisonGroup, comparisonType, extras) => ({
  name: 'DifferentialExpression',
  experimentId,
  cellSet: comparisonGroup.cellSet,
  compareWith: comparisonGroup.compareWith,
  basis: comparisonGroup.basis,
  comparisonType,
  ...extras,
});

export default generateDiffExprBody;
