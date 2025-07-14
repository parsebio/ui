import FastqFileType from 'const/enums/FastqFileType';
import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getFastqFiles = (secondaryAnalysisId, fileType = null) => (state) => {
  const fileTypes = fileType ? [fileType] : [FastqFileType.IMMUNE_FASTQ, FastqFileType.WT_FASTQ];

  return _.pickBy(
    state[secondaryAnalysisId]?.files.data,
    (file) => (
      fileTypes.includes(file.type)
    ),
  );
};

export default createMemoizedSelector(getFastqFiles);
