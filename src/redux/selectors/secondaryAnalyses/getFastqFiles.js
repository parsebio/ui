import FastqFileType from 'const/enums/FastqFileType';
import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getFastqFiles = (secondaryAnalysisId) => (state) => (
  _.pickBy(state[secondaryAnalysisId]?.files.data, (file) => file.type === FastqFileType.WT_FASTQ)
);

export default createMemoizedSelector(getFastqFiles);
