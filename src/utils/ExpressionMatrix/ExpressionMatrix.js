import _ from 'lodash';
import { SparseMatrix } from 'mathjs';

import { appendColumns, getColumn } from 'utils/ExpressionMatrix/sparseMatrixOperations';
import SparseMap from 'utils/SparseMap';

class ExpressionMatrix {
  constructor() {
    this.geneIndexes = {};

    this.rawGeneExpressions = new SparseMatrix();
    this.truncatedGeneExpressions = new SparseMatrix();
    this.zScore = new SparseMatrix();

    this.stats = {
      rawMean: [],
      rawStdev: [],
      truncatedMin: [],
      truncatedMax: [],
    };
  }

  getRawExpression(geneSymbol, cellIndexes = undefined) {
    return this.#getDensifiedExpression(geneSymbol, cellIndexes, this.rawGeneExpressions);
  }

  getTruncatedExpression(geneSymbol, cellIndexes = undefined) {
    return this.#getDensifiedExpression(geneSymbol, cellIndexes, this.truncatedGeneExpressions);
  }

  getZScore(geneSymbol, cellIndexes = undefined) {
    return this.#getDensifiedExpression(geneSymbol, cellIndexes, this.zScore);
  }

  getRawExpressionSparse(geneSymbol, cellIndexes, keyAsString = false) {
    return this.#getExpressionSparse(
      geneSymbol,
      cellIndexes,
      this.rawGeneExpressions,
      keyAsString,
    );
  }

  getTruncatedExpressionSparse(geneSymbol, cellIndexes, keyAsString = false) {
    return this.#getExpressionSparse(
      geneSymbol,
      cellIndexes,
      this.truncatedGeneExpressions,
      keyAsString,
    );
  }

  getZScoreSparse(geneSymbol, cellIndexes, keyAsString = false) {
    return this.#getExpressionSparse(
      geneSymbol,
      cellIndexes,
      this.zScore,
      keyAsString,
    );
  }

  getStats(geneSymbol) {
    const geneIndex = this.geneIndexes[geneSymbol];

    if (_.isNil(geneIndex)) return undefined;

    return {
      rawMean: this.stats.rawMean[geneIndex],
      rawStdev: this.stats.rawStdev[geneIndex],
      truncatedMin: this.stats.truncatedMin[geneIndex],
      truncatedMax: this.stats.truncatedMax[geneIndex],
    };
  }

  geneIsLoaded(geneSymbol) {
    return !_.isNil(this.geneIndexes[geneSymbol]);
  }

  genesAreLoaded(geneSymbols) {
    return geneSymbols.every((geneSymbol) => this.geneIsLoaded(geneSymbol));
  }

  getStoredGenes() {
    return Object.keys(this.geneIndexes);
  }

  /**
   *
   * @param {*} orderedNewGeneSymbols A row with the gene symbols corresponding
   * to each row in the geneExpressions (in the same order)
   * @param {*} newRawGeneExpression A mathjs SparseMatrix with the
   *  raw gene expressions for each of the genes
   * @param {*} newTruncatedGeneExpression A mathjs SparseMatrix with the
   *  raw gene expressions for each of the genes
   * @param {*} newZScore A mathjs SparseMatrix with the
   *  zScore values for each of the genes
   * @param {*} newStats An object which with the stats for each gene's expression
   * Each key is a gene symbol,
   * Each value has this shape: {rawMean, rawStdev, truncatedMin, truncatedMax}
   */
  pushGeneExpression(
    orderedNewGeneSymbols,
    newRawGeneExpression,
    newTruncatedGeneExpression,
    newZScore,
    newStats,
  ) {
    const [, genesCount] = this.rawGeneExpressions.size();

    // If the matrix was empty previously we can just replace it with the ones that are being pushed
    if (genesCount === 0) {
      this.setGeneExpression(
        orderedNewGeneSymbols,
        newRawGeneExpression,
        newTruncatedGeneExpression,
        newZScore,
        newStats,
      );
      return;
    }

    const genesToAddIndexes = [];

    // Store indexes for the new genes
    orderedNewGeneSymbols.forEach((geneSymbol, index) => {
      // Skip if gene is already loaded
      if (this.geneIsLoaded(geneSymbol)) return;

      genesToAddIndexes.push(index);

      this.#generateIndexFor(geneSymbol);
    });

    // Add the expression only for the new genes (genesToAddIndexes)
    appendColumns(this.rawGeneExpressions, newRawGeneExpression, genesToAddIndexes);
    appendColumns(this.truncatedGeneExpressions, newTruncatedGeneExpression, genesToAddIndexes);
    appendColumns(this.zScore, newZScore, genesToAddIndexes);

    // Add new stats only for the genes that were added
    genesToAddIndexes.forEach((index) => {
      this.stats.rawMean.push(newStats.rawMean[index]);
      this.stats.rawStdev.push(newStats.rawStdev[index]);
      this.stats.truncatedMin.push(newStats.truncatedMin[index]);
      this.stats.truncatedMax.push(newStats.truncatedMax[index]);
    });
  }

  setGeneExpression = (
    orderedNewGeneSymbols,
    newRawGeneExpression,
    newTruncatedGeneExpression,
    newZScore,
    newStats,
  ) => {
    this.rawGeneExpressions = newRawGeneExpression;
    this.truncatedGeneExpressions = newTruncatedGeneExpression;
    this.zScore = newZScore;
    this.stats = newStats;

    this.geneIndexes = orderedNewGeneSymbols.reduce((acum, currentSymbol, index) => {
      // eslint-disable-next-line no-param-reassign
      acum[currentSymbol] = index;
      return acum;
    }, {});
  };

  /**
   * Generates a new index for the geneSymbol
   *
   * @param {*} geneSymbol The symbol of the gene
   * @returns The index of the gene inside the matrices
   */
  #generateIndexFor = (geneSymbol) => {
    const lastFreeIndex = Object.keys(this.geneIndexes).length;

    this.geneIndexes[geneSymbol] = lastFreeIndex;

    return lastFreeIndex;
  };

  #getExpression = (geneSymbol, cellIndexes, matrix) => {
    const geneIndex = this.geneIndexes[geneSymbol];

    if (_.isNil(geneIndex)) return undefined;

    if (cellIndexes?.length === 0) return [];

    const result = getColumn(geneIndex, matrix, cellIndexes);

    return result;
  };

  #getDensifiedExpression = (geneSymbol, cellIndexes, matrix) => {
    const result = this.#getExpression(geneSymbol, cellIndexes, matrix);

    // If it's a single number wrap in an array
    if (typeof result === 'number') return [result];

    if (_.isNil(result) || _.isEmpty(result)) return result;

    // If its a matrix transform it to an array
    return result.valueOf().flat();
  };

  #getExpressionSparse = (geneSymbol, cellIndexes, matrix, keyAsString) => {
    const result = this.#getExpression(geneSymbol, cellIndexes, matrix);

    if (_.isNil(result) || _.isEmpty(result)) return new SparseMap([]);

    // If it's a single number just return a simple Map
    if (typeof result === 'number') return new SparseMap([[cellIndexes[0], result]]);

    return new SparseMap(result, cellIndexes, keyAsString);
  };
}

export default ExpressionMatrix;
