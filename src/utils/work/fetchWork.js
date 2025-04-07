import _ from 'lodash';

import { isBrowser } from 'utils/deploymentInfo';

import cache from 'utils/cache';
import dispatchWorkRequest from 'utils/work/dispatchWorkRequest';
import downloadFromS3 from 'utils/work/downloadFromS3';
import waitForWorkRequest from 'utils/work/waitForWorkRequest';
import checkRequest from 'utils/work/checkRequest';

const getCachedResult = async (ETag, signedUrl, useBrowserCache) => {
  // Check if we have the ETag in the browser cache (no worker)
  const cachedData = useBrowserCache ? await cache.get(ETag) : null;
  if (cachedData) {
    return cachedData;
  }

  if (_.isNil(signedUrl)) {
    return null;
  }

  const data = await downloadFromS3(ETag, signedUrl);

  if (useBrowserCache) {
    await cache.set(ETag, data);
  }

  return data;
};

const getResult = async (
  experimentId,
  ETag,
  request,
  timeout,
  body,
  dispatch,
) => {
  const { signedUrl, data } = await waitForWorkRequest(
    ETag,
    experimentId,
    request,
    timeout,
    dispatch,
  );

  if (data) {
    return data;
  }

  return await downloadFromS3(body.name, signedUrl);
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

  if (!isBrowser) {
    throw new Error('Disabling network interaction on server');
  }

  const useBrowserCache = body.name !== 'GeneExpression';

  const { signedUrl, ETag } = await checkRequest(
    experimentId,
    body,
    {
      broadcast,
      ...extras,
    },
    getState,
  );

  onETagGenerated(ETag);

  const cachedResult = await getCachedResult(ETag, signedUrl, useBrowserCache);

  if (cachedResult) {
    return cachedResult;
  }

  const request = await dispatchWorkRequest(
    experimentId,
    body,
    timeout,
    ETag,
    broadcast,
  );

  const data = await getResult(
    experimentId, ETag, request, timeout, body, dispatch,
  );

  if (useBrowserCache) {
    await cache.set(ETag, data);
  }

  return data;
};

export default fetchWork;
