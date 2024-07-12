import _ from 'lodash';

// Default platform data
import cellSetsData from '__test__/data/cell_sets.json';
import backendStatusData from '__test__/data/backend_status.json';
import processingConfigData from '__test__/data/processing_config.json';
import mockDemoExperiments from '__test__/test-utils/mockData/mockDemoExperiments.json';
import { mockSecondaryAnalyses } from '__test__/data/secondaryAnalyses/secondary_analyses';
import mockSecondaryAnalysisStatusDefault from '__test__/data/secondaryAnalyses/secondary_analysis_status_default.json';
import fake from '__test__/test-utils/constants';
import mockAnalysisFiles from '__test__/data/secondaryAnalyses/secondary_analysis_files';

import {
  responseData,
} from '__test__/test-utils/mockData';

const promiseResponse = (
  response,
  options = {},
) => Promise.resolve(new Response(response, options));

const statusResponse = (code, body) => (
  Promise.resolve({
    status: code,
    body: JSON.stringify(body),
  })
);

const delayedResponse = (response, delay = 10000, options = {}) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(new Response(response, options));
  }, delay);
});

const workerDataResult = (data) => Promise.resolve(_.cloneDeep(data));

const fetchWorkMock = (
  mockedResults,
) => ((experimentId, body) => {
  if (typeof mockedResults[body.name] === 'function') {
    return mockedResults[body.name]();
  }

  return workerDataResult(mockedResults[experimentId]);
});

const generateDefaultMockAPIResponses = (projectId) => ({
  [`experiments/${projectId}$`]: () => promiseResponse(
    JSON.stringify(responseData.experiments.find(({ id }) => id === projectId)),
  ),
  [`experiments/${projectId}/processingConfig$`]: () => promiseResponse(
    JSON.stringify(processingConfigData),
  ),
  [`experiments/${projectId}/cellSets$`]: () => promiseResponse(
    JSON.stringify(cellSetsData),
  ),
  [`experiments/${projectId}/backendStatus$`]: () => promiseResponse(
    JSON.stringify(backendStatusData),
  ),
  experiments$: () => promiseResponse(
    JSON.stringify(responseData.experiments),
  ),
  [`experiments/${projectId}/samples$`]: () => promiseResponse(
    JSON.stringify(responseData.samples[0]),
  ),
  '/v2/experiments/examples$': () => promiseResponse(
    JSON.stringify(mockDemoExperiments),
  ),
  'experiments/clone$': () => promiseResponse(
    JSON.stringify(fake.CLONED_EXPERIMENT_ID),
  ),
  [`/v2/workRequest/${projectId}`]: () => statusResponse(200, 'OK'),
  '/v2/secondaryAnalysis$': () => promiseResponse(
    JSON.stringify(mockSecondaryAnalyses),
  ),
  [`/v2/secondaryAnalysis/${projectId}/executionStatus`]: () => promiseResponse(
    JSON.stringify(mockSecondaryAnalysisStatusDefault),
  ),
  [`/v2/secondaryAnalysis/${projectId}/files`]: () => promiseResponse(
    JSON.stringify(mockAnalysisFiles),
  ),
});

const mockAPI = (apiMapping) => (req) => {
  const path = req.url;

  const key = _.find(Object.keys(apiMapping), (matcherStr) => new RegExp(matcherStr).test(path));

  if (!key) {
    return statusResponse({
      status: 404,
      body: `Path ${path} is undefined`,
    });
  }

  return apiMapping[key](req);
};

export default mockAPI;
export {
  generateDefaultMockAPIResponses,
  promiseResponse,
  statusResponse,
  delayedResponse,
  workerDataResult,
  fetchWorkMock,
};
