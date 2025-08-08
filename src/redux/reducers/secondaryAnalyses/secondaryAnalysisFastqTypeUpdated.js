/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisFastqTypeUpdated = produce((draft, action) => {
  const { secondaryAnalysisId, fileIds, fastqType } = action.payload;

  fileIds.forEach((fileId) => {
    draft[secondaryAnalysisId].files.data[fileId].type = fastqType;
  });
});

export default secondaryAnalysisFastqTypeUpdated;
