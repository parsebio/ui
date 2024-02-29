import produce from 'immer';

const secondaryAnalysisFileError = produce((draft, action) => {
  const { secondaryAnalysisId } = action.payload;
  draft[secondaryAnalysisId].files.loading = false;
  draft[secondaryAnalysisId].files.error = action.payload.error;
});

export default secondaryAnalysisFileError;
