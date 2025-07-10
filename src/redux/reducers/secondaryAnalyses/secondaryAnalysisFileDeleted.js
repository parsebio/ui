/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisFileDeleted = produce((draft, action) => {
  const { secondaryAnalysisId, fileId, pairMatches } = action.payload;

  delete draft[secondaryAnalysisId].files.data[fileId];

  draft[secondaryAnalysisId].files.pairMatches = pairMatches;
});
export default secondaryAnalysisFileDeleted;
