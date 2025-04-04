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

  // Check if data is cached in S3 so we can download from the signed URL (no worker)
  if (signedUrl) {
    return await downloadFromS3(ETag, signedUrl);
  }

  return null;
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

  const result = await getCachedResult(ETag, signedUrl, useBrowserCache);
  if (result) {
    return result;
  }

  // 1. Contact the API to get ETag and possible S3 signedURL
  const { request } = await dispatchWorkRequest(
    experimentId,
    body,
    timeout,
    ETag,
  );

  // 2. Try to get the data from the fastest source possible
  const data = await getResult(
    experimentId, ETag, request, timeout, body, dispatch,
  );

  // 3. Cache the data in the browser
  if (useBrowserCache) {
    await cache.set(ETag, data);
  }

  return data;
};

export default fetchWork;
