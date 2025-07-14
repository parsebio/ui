import FastqFileType from 'const/enums/FastqFileType';
import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getFastqFiles = (secondaryAnalysisId) => (state) => (
  _.pickBy(state[secondaryAnalysisId]?.files.data, (file) => (
    [FastqFileType.IMMUNE_FASTQ, FastqFileType.WT_FASTQ].includes(file.type)))
);

export default createMemoizedSelector(getFastqFiles);
