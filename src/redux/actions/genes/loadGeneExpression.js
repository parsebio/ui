import _ from 'lodash';
import { SparseMatrix } from 'mathjs';

import {
  GENES_EXPRESSION_LOADING, GENES_EXPRESSION_ERROR, GENES_EXPRESSION_LOADED,
} from 'redux/actionTypes/genes';

import fetchWork from 'utils/work/fetchWork';
import getTimeoutForWorkerTask from 'utils/getTimeoutForWorkerTask';
import upperCaseArray from 'utils/upperCaseArray';

const findLoadedGenes = (matrix, selectedGenes) => {
  // Check which of the genes we actually need to load. Only do this if
  // we are not forced to reload all of the data.
  const storedGenes = matrix.getStoredGenes();
  const genesNotLoaded = [...selectedGenes].filter(
    (gene) => !new Set(upperCaseArray(storedGenes)).has(gene.toUpperCase()),
  );

  const genesAlreadyLoaded = storedGenes.filter(
    (gene) => upperCaseArray(selectedGenes).includes(gene.toUpperCase()),
  );

  return { genesNotLoaded, genesAlreadyLoaded };
};

const loadGeneExpression = (
  experimentId,
  genes,
  componentUuid,
) => async (dispatch, getState) => {
  const { loading, matrix } = getState().genes.expression.full;

  // Remove the gene loads that are already being handled in a different request
  let genesToLoad = _.difference(genes, loading);
  if (genesToLoad.length === 0) {
    return null;
  }

  const { genesNotLoaded, genesAlreadyLoaded } = findLoadedGenes(matrix, genesToLoad);

  genesToLoad = genesNotLoaded;

  if (genesToLoad.length === 0) {
    return dispatch({
      type: GENES_EXPRESSION_LOADED,
      payload: {
        experimentId,
        componentUuid,
        genes: genesAlreadyLoaded,
      },
    });
  }

  dispatch({
    type: GENES_EXPRESSION_LOADING,
    payload: {
      experimentId,
      componentUuid,
      genes: genesToLoad,
    },
  });

  const body = {
    name: 'GeneExpression',
    genes: genesToLoad,
    downsampled: false,
  };

  const timeout = getTimeoutForWorkerTask(getState(), 'GeneExpression');

  try {
    const {
      orderedGeneNames,
      rawExpression: rawExpressionJson,
      truncatedExpression: truncatedExpressionJson,
      zScore: zScoreJson,
      stats,
    } = await fetchWork(experimentId, body, getState, dispatch, { timeout });

    const rawExpression = SparseMatrix.fromJSON(rawExpressionJson);
    const truncatedExpression = SparseMatrix.fromJSON(truncatedExpressionJson);
    const zScore = SparseMatrix.fromJSON(zScoreJson);

    const fetchedGenes = _.concat(genesAlreadyLoaded, orderedGeneNames);

    dispatch({
      type: GENES_EXPRESSION_LOADED,
      payload: {
        componentUuid,
        genes: fetchedGenes,
        newGenes: {
          orderedGeneNames,
          stats,
          rawExpression,
          truncatedExpression,
          zScore,
        },
      },
    });
  } catch (error) {
    dispatch({
      type: GENES_EXPRESSION_ERROR,
      payload: {
        experimentId,
        componentUuid,
        genes: genesToLoad,
        error,
      },
    });
  }
};

export default loadGeneExpression;
