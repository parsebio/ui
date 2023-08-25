import { Environment, isBrowser } from 'utils/deploymentInfo';

import { getBackendStatus } from 'redux/selectors';

import cache from 'utils/cache';
import generateETag from 'utils/work/generateETag';
import { dispatchWorkRequest, seekFromS3 } from 'utils/work/seekWorkResponse';

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

// Temporarily using gene expression without local cache
const fetchGeneExpressionWorkWithoutLocalCache = async (
  experimentId,
  timeout,
  body,
  backendStatus,
  environment,
  broadcast,
  extras,
  dispatch,
  getState,
) => {
  logWithDate('fetchGeneExpressionWorkWithoutLocalCacheDebug1');

  // If new genes are needed, construct payload, try S3 for results,
  // and send out to worker if there's a miss.
  const { pipeline: { startDate: qcPipelineStartDate } } = backendStatus;

  logWithDate('fetchGeneExpressionWorkWithoutLocalCacheDebug2');

  const ETag = await generateETag(
    experimentId,
    body,
    extras,
    qcPipelineStartDate,
    environment,
    dispatch,
    getState,
  );

  logWithDate('fetchGeneExpressionWorkWithoutLocalCacheDebug3');
  try {
    const { signedUrl, data } = await dispatchWorkRequest(
      experimentId,
      body,
      timeout,
      ETag,
      {
        ETagPipelineRun: qcPipelineStartDate,
        broadcast,
        ...extras,
      },
    );

    logWithDate('fetchGeneExpressionWorkWithoutLocalCacheDebug4');

    console.log('signedUrlGene');
    console.log(signedUrl);

    console.log('dataDebug');
    console.log(data);

    const a = data ?? await seekFromS3(ETag, experimentId, body.name, signedUrl);
    logWithDate('fetchGeneExpressionWorkWithoutLocalCacheDebug5');

    return a;
  } catch (error) {
    console.error('Error dispatching work request: ', error);
    throw error;
  }
};

const fetchWork = async (
  experimentId,
  body,
  getState,
  dispatch,
  optionals = {},
) => {
  const {
    extras = undefined,
    timeout = 180,
    broadcast = false,
    onETagGenerated = () => { },
  } = optionals;

  logWithDate('fetchWorkDebug1');

  const backendStatus = getBackendStatus(experimentId)(getState()).status;

  logWithDate('fetchWorkDebug2');

  const { environment } = getState().networkResources;

  if (!isBrowser) {
    throw new Error('Disabling network interaction on server');
  }

  logWithDate('fetchWorkDebug3');

  if (environment === Environment.DEVELOPMENT && !localStorage.getItem('disableCache')) {
    localStorage.setItem('disableCache', 'true');
  }

  const { pipeline: { startDate: qcPipelineStartDate } } = backendStatus;

  logWithDate('fetchWorkDebug4');

  if (body.name === 'GeneExpression') {
    logWithDate('fetchWorkDebug5');

    return fetchGeneExpressionWorkWithoutLocalCache(
      experimentId,
      timeout,
      body,
      backendStatus,
      environment,
      broadcast,
      extras,
      dispatch,
      getState,
    );
  }

  logWithDate('fetchWorkDebug6');

  const ETag = await generateETag(
    experimentId,
    body,
    extras,
    qcPipelineStartDate,
    environment,
    dispatch,
    getState,
  );

  onETagGenerated(ETag);

  // First, let's try to fetch this information from the local cache.
  const cachedData = await cache.get(ETag);

  if (cachedData) {
    return cachedData;
  }

  // If there is no response in S3, dispatch workRequest via the worker
  try {
    const { signedUrl, data } = await dispatchWorkRequest(
      experimentId,
      body,
      timeout,
      ETag,
      {
        PipelineRunETag: qcPipelineStartDate,
        broadcast,
        ...extras,
      },
    );

    console.log('signedUrlDebug');
    console.log(signedUrl);

    const response = data ?? await seekFromS3(ETag, experimentId, body.name, signedUrl);

    await cache.set(ETag, response);

    return response;
  } catch (error) {
    console.error('Error dispatching work request', error);
    throw error;
  }
};

export default fetchWork;
