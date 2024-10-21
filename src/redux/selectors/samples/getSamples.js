import _ from 'lodash';

const getSamples = (experimentId) => (samples) => (_.omitBy(samples,
  (value) => value.experimentId && value.experimentId !== experimentId));
export default getSamples;
