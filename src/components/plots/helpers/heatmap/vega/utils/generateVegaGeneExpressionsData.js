const cartesian = (...array) => (
  array.reduce((acum, value) => (
    acum.flatMap((d) => (
      value.map((e) => [d, e].flat())
    ))
  ))
);

const generateVegaGeneExpressionsData = (
  cellOrder,
  geneOrder,
  expressionMatrix,
  heatmapSettings,
) => {
  const { expressionValue, truncatedValues } = heatmapSettings;

  const geneExpressionsData = [];

  if (!expressionMatrix.genesAreLoaded(geneOrder)) {
    return;
  }

  // Preload all genes so that their arrays are generated only once
  const preloadedExpressions = {};
  geneOrder.forEach((gene) => {
    if (expressionValue === 'zScore') {
      preloadedExpressions[gene] = { zScore: expressionMatrix.getZScore(gene, cellOrder) };
      return;
    }

    const geneExpression = { rawExpression: expressionMatrix.getRawExpression(gene, cellOrder) };

    if (truncatedValues) {
      geneExpression.truncatedExpression = expressionMatrix.getTruncatedExpression(gene, cellOrder);
    }

    preloadedExpressions[gene] = geneExpression;
  });

  const cellOrderWithIndexes = cellOrder.map((cellId, index) => ({ cellId, index }));

  cartesian(geneOrder, cellOrderWithIndexes).forEach(
    ([gene, { cellId, index }]) => {
      let expressionValues = {};

      if (expressionValue === 'zScore') {
        expressionValues = {
          color: preloadedExpressions[gene].zScore, display: preloadedExpressions[gene].zScore,
        };
      } else {
        expressionValues.display = preloadedExpressions[gene].rawExpression;
        expressionValues.color = truncatedValues
          ? preloadedExpressions[gene].truncatedExpression
          : preloadedExpressions[gene].rawExpression;
      }

      geneExpressionsData.push({
        cellId,
        gene,
        expression: expressionValues.color[index],
        displayExpression: expressionValues.display[index],
      });
    },
  );

  return geneExpressionsData;
};

export default generateVegaGeneExpressionsData;
