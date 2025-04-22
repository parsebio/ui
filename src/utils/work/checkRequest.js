import { Environment } from 'utils/deploymentInfo';
import fetchAPI from 'utils/http/fetchAPI';

// Disable unique keys to reallow reuse of work results in development
const DISABLE_UNIQUE_KEYS = [
  'GetEmbedding',
];

const getCacheUniquenessKey = (taskName, environment) => {
  // Disable cache in development or if localStorage says so
  // Do not disable for embeddings requests because download seurat & trajectory depend on that ETag
  if (
    environment !== Environment.PRODUCTION
    && (localStorage.getItem('disableCache') === 'true')
    && !DISABLE_UNIQUE_KEYS.includes(taskName)
  ) {
    return Math.random();
  }

  return null;
};

const checkRequest = async (experimentId, body, requestProps, getState) => {
  const { environment } = getState().networkResources;
  const cacheUniquenessKey = getCacheUniquenessKey(body.name, environment);

  const request = {
    experimentId,
    body,
    requestProps: {
      ...requestProps,
      cacheUniquenessKey,
    },
  };

  const { ETag, signedUrl } = await fetchAPI(
    `/v2/workRequest/${experimentId}/check`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
  );

  return { ETag, signedUrl };
};

export default checkRequest;
