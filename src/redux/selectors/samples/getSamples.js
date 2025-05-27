import _ from 'lodash';

// experimentId might be undefined so we need to check for it
const getSamples = (experimentId) => (samples) => (
  _.omitBy(samples, (value) => value.experimentId && value.experimentId !== experimentId)
);
export default getSamples;
