import _ from 'lodash';

// Default platform data
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

// Mock downloadFromS3 to return cell sets data when the signed URL is used
jest.mock('utils/work/downloadFromS3', () => jest.fn().mockImplementation((resource, signedUrl) => {
  // eslint-disable-next-line global-require
  const cellSetsData = require('__test__/data/cell_sets.json'); // Load the JSON file dynamically within the mock
  if (signedUrl === 'mock-signed-url') {
    return Promise.resolve({ cellSets: cellSetsData });
  }
  return Promise.reject(new Error('Invalid signed URL'));
}));

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
    JSON.stringify('mock-cellsets-signed-url'), // Returning the signed URL as expected
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
  [`/v2/projects/${projectId}/upload/.*/part/\\d+/signedUrl$`]: (req) => {
    const partNumber = req.url.match(/part\/(\d+)\/signedUrl/)[1];

    return promiseResponse(JSON.stringify(`mockSignedUrl${partNumber}`));
  },
  '/v2/cliUpload/token$': () => promiseResponse(JSON.stringify('token')),
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
