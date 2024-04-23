import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const FASTQ = 'fastq';

const getFastqFiles = (secondaryAnalysisId) => (state) => (
  _.pickBy(state[secondaryAnalysisId]?.files.data, (file) => file.type === FASTQ)
);

export default createMemoizedSelector(getFastqFiles);
