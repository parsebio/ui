const generateDiffExprBody = (
  experimentId,
  comparisonGroup,
  comparisonType,
  extras,
  pagination = undefined,
) => ({
  name: 'DifferentialExpression',
  experimentId,
  cellSet: comparisonGroup.cellSet,
  compareWith: comparisonGroup.compareWith,
  basis: comparisonGroup.basis,
  comparisonType,
  pagination,
  ...extras,
});

export default generateDiffExprBody;
