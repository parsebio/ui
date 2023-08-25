import _ from 'lodash';
import { SparseMatrix } from 'mathjs';

import {
  GENES_EXPRESSION_LOADING, GENES_EXPRESSION_ERROR, GENES_EXPRESSION_LOADED,
} from 'redux/actionTypes/genes';

import fetchWork from 'utils/work/fetchWork';
import getTimeoutForWorkerTask from 'utils/getTimeoutForWorkerTask';

const logWithDate = (logStr) => {
  const date = new Date();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  console.log(
    `[${(hour < 10) ? `0${hour}` : hour
    }:${(minutes < 10) ? `0${minutes}` : minutes
    }:${(seconds < 10) ? `0${seconds}` : seconds
    }.${(`00${milliseconds}`).slice(-3)
    }] ${logStr}`,
  );
};

const loadGeneExpression = (
  experimentId, genes, componentUuid, useDownsampledExpression = false,
) => async (dispatch, getState) => {
  const {
    loading, matrix, downsampledMatrix,
  } = getState().genes.expression;

  // If other gene expression data is already being loaded, don't dispatch.
  if (loading.length > 0) {
    return null;
  }

  const upperCaseArray = (array) => (array.map((element) => element.toUpperCase()));

  // Dispatch loading state.
  dispatch({
    type: GENES_EXPRESSION_LOADING,
    payload: {
      experimentId,
      componentUuid,
      genes,
    },
  });

  logWithDate('loadGeneExpressionDebug1');

  // Check which of the genes we actually need to load. Only do this if
  // we are not forced to reload all of the data.
  let genesToFetch = [...genes];
  let genesAlreadyLoaded;

  logWithDate('loadGeneExpressionDebug2');

  // If we are using the downsampled expression, then check downsampledMatrix as well
  // as the normal one (we can use both)
  if (useDownsampledExpression) {
    genesAlreadyLoaded = downsampledMatrix.getStoredGenes();
  } else {
    genesAlreadyLoaded = matrix.getStoredGenes();
  }

  logWithDate('loadGeneExpressionDebug3');

  genesToFetch = genesToFetch.filter(
    (gene) => !new Set(upperCaseArray(genesAlreadyLoaded)).has(gene.toUpperCase()),
  );

  const displayedGenes = genesAlreadyLoaded.filter(
    (gene) => upperCaseArray(genes).includes(gene.toUpperCase()),
  );

  logWithDate('loadGeneExpressionDebug4');

  if (genesToFetch.length === 0) {
    // All genes are already loaded.
    return dispatch({
      type: GENES_EXPRESSION_LOADED,
      payload: {
        experimentId,
        componentUuid,
        genes: displayedGenes,
      },
    });
  }

  const body = {
    name: 'GeneExpression',
    genes: genesToFetch,
  };

  logWithDate('loadGeneExpressionDebug5');

  const timeout = getTimeoutForWorkerTask(getState(), 'GeneExpression');

  logWithDate('loadGeneExpressionDebug6');

  try {
    logWithDate('loadGeneExpressionDebug7');

    const {
      orderedGeneNames,
      rawExpression: rawExpressionJson,
      truncatedExpression: truncatedExpressionJson,
      zScore: zScoreJson,
      stats,
    } = await fetchWork(
      experimentId, body, getState, dispatch, { timeout },
    );

    logWithDate('loadGeneExpressionDebug8');

    const rawExpression = SparseMatrix.fromJSON(rawExpressionJson);
    const truncatedExpression = SparseMatrix.fromJSON(truncatedExpressionJson);
    const zScore = SparseMatrix.fromJSON(zScoreJson);

    const fetchedGenes = _.concat(displayedGenes, orderedGeneNames);

    logWithDate('loadGeneExpressionDebug9');

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
        genes,
        error,
      },
    });
  }
};

export default loadGeneExpression;
