import { omitBy } from 'lodash';

const getSamples = (experimentId) => (samples) => (omitBy(samples,
  (value) => value.experimentId && value.experimentId !== experimentId));
export default getSamples;
