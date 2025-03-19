import _ from 'lodash';
import { analysisTools } from 'utils/constants';
import generateMockSamples from './generateMockSamples';
import generateMockExperiments from './generateMockExperiments';
import generateMockProcessingConfig from './generateMockProcessingConfig';

// This file is a work in progress to generate mock data for the endpoints of the test.
// The generated data should be usable as response data to be sent via the mocked API in mockAPI.js
// The module should also expose the generated data that can be imported and used easily in tests

const responseData = {};

responseData.experiments = generateMockExperiments(2);

responseData.samples = [generateMockSamples(
  responseData.experiments[0],
  3,
)];

responseData.processingConfigSeurat = generateMockProcessingConfig(analysisTools.SEURAT, 3);
responseData.processingConfigScanpy = generateMockProcessingConfig(analysisTools.SCANPY, 3);

// Add samples to first experiment
const samples = responseData.samples[0];
const sampleIds = _.map(samples, 'id');
responseData.experiments[0].samplesOrder = sampleIds;

const { experiments, processingConfigSeurat, processingConfigScanpy } = responseData;

export {
  experiments,
  samples,
  processingConfigSeurat,
  processingConfigScanpy,
  responseData,
};
