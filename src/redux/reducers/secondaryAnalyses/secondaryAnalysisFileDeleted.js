import produce from 'immer';

const secondaryAnalysisFileDeleted = produce((draft, action) => {
  const { secondaryAnalysisId, fileId } = action.payload;

  delete draft[secondaryAnalysisId].files[fileId];
});
export default secondaryAnalysisFileDeleted;
