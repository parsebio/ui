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

// retrieveData will try to get the data for the given experimentId and ETag from
// the fastest source possible. It will try to get the data in order from:
// 1. Browser cache
// 2. S3 (cache) via signedURL
// 3. Worker
//   3.1. Via socket (small data)
//   3.2. Via S3 (large data) via signedURL
const getResult = async (
  experimentId,
  ETag,
  signedUrl,
  request,
  timeout,
  body,
  dispatch,
  useBrowserCache,
) => {
  // TODO check if this is still necessary, probably not
  const cachedResult = await getCachedResult(ETag, signedUrl, useBrowserCache);

  if (cachedResult) {
    return cachedResult;
  }

  // 3. If we don't have signedURL, wait for the worker to send us the data via
  // - the data via socket
  // - the signedURL to download the data from S3
  const { signedUrl: workerSignedUrl, data } = await waitForWorkRequest(
    ETag,
    experimentId,
    request,
    timeout,
    dispatch,
  );

  // 3.1. The worker send the data via socket because it's small enough
  if (data) {
    return data;
  }

  // 3.2. The worker send a signedUrl to download the data
  return await downloadFromS3(body.name, workerSignedUrl);
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
    experimentId, ETag, signedUrl, request, timeout, body, dispatch, useBrowserCache,
  );

  // 3. Cache the data in the browser
  if (useBrowserCache) {
    await cache.set(ETag, data);
  }

  return data;
};

export default fetchWork;
