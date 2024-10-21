import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

import getSamples from './getSamples';

// unused param is used to pass the experimentId to the input selector
// eslint-disable-next-line no-unused-vars
const getMetadataToSampleIds = (experimentId) => (samples) => {
  const metadataToSampleIds = {};

  Object.entries(samples).forEach(([key, entry]) => {
    if (key === 'meta') {
      return;
    }
    Object.entries(entry.metadata)?.forEach(([metadataKey, metadataValue]) => {
      if (!metadataToSampleIds[metadataKey]) {
        metadataToSampleIds[metadataKey] = {};
      }
      if (!metadataToSampleIds[metadataKey][metadataValue]) {
        metadataToSampleIds[metadataKey][metadataValue] = [];
      }
      metadataToSampleIds[metadataKey][metadataValue].push(key);
    });
  });

  return metadataToSampleIds;
};

export default createMemoizedSelector(
  getMetadataToSampleIds,
  {
    inputSelectors: [{
      func: getSamples,
      paramsIngest: (experimentId) => [experimentId],
    }],
  },
);
