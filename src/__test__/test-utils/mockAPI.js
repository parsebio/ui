import _ from 'lodash';
import backendStatusData from '__test__/data/backend_status.json';
import processingConfigData from '__test__/data/processing_config.json';
import mockDemoExperiments from '__test__/test-utils/mockData/mockDemoExperiments.json';
import { mockSecondaryAnalyses } from '__test__/data/secondaryAnalyses/secondary_analyses';
import mockSecondaryAnalysisStatusDefault from '__test__/data/secondaryAnalyses/secondary_analysis_status_default.json';
import fake from '__test__/test-utils/constants';
import mockAnalysisFiles from '__test__/data/secondaryAnalyses/secondary_analysis_files';
import downloadFromS3 from 'utils/work/downloadFromS3';

import {
  responseData,
} from '__test__/test-utils/mockData';
import { analysisTools } from 'const';

const cellSetsData = require('__test__/data/cell_sets.json');

const setupDownloadCellSetsFromS3Mock = (customCellSets = cellSetsData) => {
  downloadFromS3.mockImplementation((resource, signedUrl) => {
    // eslint-disable-next-line global-require
    if (signedUrl === 'mock-cellsets-signed-url') {
      return Promise.resolve(customCellSets);
    }
    return Promise.reject(new Error('Invalid signed URL'));
  });
};

const promiseResponse = (response, options = {}) => (
  Promise.resolve(new Response(response, options)));

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

const fetchWorkMock = (mockedResults) => ((experimentId, body) => {
  if (typeof mockedResults[body.name] === 'function') {
    return mockedResults[body.name]();
  }
  return workerDataResult(mockedResults[experimentId]);
});

const generateDefaultMockAPIResponses = (projectId, analysisTool = analysisTools.SEURAT) => ({
  [`experiments/${projectId}$`]: () => promiseResponse(
    JSON.stringify(responseData.experiments.find(({ id }) => id === projectId)),
  ),
  [`/v2/experiments/${projectId}$`]: () => promiseResponse(
    JSON.stringify(responseData.experiments.find(({ id }) => id === projectId)),
  ),
  [`experiments/${projectId}/processingConfig$`]: () => {
    const processingConfigDataClone = _.cloneDeep(processingConfigData);
    processingConfigDataClone.processingConfig.dataIntegration.analysisTool = analysisTool;

    return promiseResponse(
      JSON.stringify(processingConfigDataClone),
    );
  },
  [`experiments/${projectId}/cellSets$`]: () => {
    setupDownloadCellSetsFromS3Mock();
    return promiseResponse(
      JSON.stringify('mock-cellsets-signed-url'),
    );
  },
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
  '/v2/secondaryAnalysis$': () => {
    const mockedMainSecondary = _.cloneDeep(mockSecondaryAnalyses[1]);
    mockedMainSecondary.id = projectId;

    return promiseResponse(
      JSON.stringify([
        mockedMainSecondary,
        ...mockSecondaryAnalyses,
      ]),
    );
  },
  [`/v2/secondaryAnalysis/${projectId}/executionStatus`]: () => promiseResponse(
    JSON.stringify(mockSecondaryAnalysisStatusDefault),
  ),
  [`/v2/secondaryAnalysis/${projectId}/files`]: (req) => {
    if (req.method === 'GET') {
      return promiseResponse(
        JSON.stringify(mockAnalysisFiles),
      );
    }

    if (req.method === 'POST') {
      return promiseResponse(
        JSON.stringify({ fileId: 'mockFileId' }),
      );
    }
  },
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
  setupDownloadCellSetsFromS3Mock,
};
