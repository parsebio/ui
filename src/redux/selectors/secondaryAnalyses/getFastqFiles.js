import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const WT_FASTQ = 'wtFastq';

const getFastqFiles = (secondaryAnalysisId) => (state) => (
  _.pickBy(state[secondaryAnalysisId]?.files.data, (file) => file.type === WT_FASTQ)
);

export default createMemoizedSelector(getFastqFiles);
