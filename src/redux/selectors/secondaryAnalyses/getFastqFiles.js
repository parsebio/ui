import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const WT_FASTQ = 'wtFastq';
const IMMUNE_FASTQ = 'immuneFastq';

const getFastqFiles = (secondaryAnalysisId) => (state) => (
  _.pickBy(state[secondaryAnalysisId]?.files.data, (file) => (
    [IMMUNE_FASTQ, WT_FASTQ].includes(file.type)))
);

export default createMemoizedSelector(getFastqFiles);
