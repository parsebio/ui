import dayjs from 'dayjs';
import fetchAPI from 'utils/http/fetchAPI';

const getWorkerTimeout = (taskName, defaultTimeout) => {
  switch (taskName) {
    case 'GetEmbedding':
    case 'ListGenes':
    case 'MarkerHeatmap': {
      return dayjs().add(1800, 's').toISOString();
    }

    default: {
      return dayjs().add(defaultTimeout, 's').toISOString();
    }
  }
};

const dispatchWorkRequest = async (
  experimentId,
  body,
  timeout,
  ETag,
  broadcast,
) => {
  const { name: taskName } = body;

  // for listGenes, markerHeatmap, & getEmbedding we set a long timeout for the worker
  // after that timeout the worker will skip those requests
  // meanwhile in the UI we set a shorter timeout. The UI will be prolonging this timeout
  // as long as it receives "heartbeats" from the worker because that means the worker is alive
  // and progresing.
  // this should be removed if we make each request run in a different worker
  const workerTimeoutDate = getWorkerTimeout(taskName, timeout);

  const requestTime = dayjs().toISOString();

  const request = {
    experimentId,
    ETag,
    timeout: workerTimeoutDate,
    requestTime,
    body,
    requestProps: {
      broadcast,
    },
  };

  await fetchAPI(
    `/v2/workRequest/${experimentId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
  );

  return request;
};

export default dispatchWorkRequest;
