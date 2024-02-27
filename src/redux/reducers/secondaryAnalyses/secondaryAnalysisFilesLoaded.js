const { default: produce } = require('immer');

const secondaryAnalysisFilesLoaded = produce((draft, action) => {
  const { files, secondaryAnalysisId } = action.payload;
  draft[secondaryAnalysisId].files.loading = false;
  files.forEach((file) => {
    draft[secondaryAnalysisId].files.data[file.id] = file;
  });
});

export default secondaryAnalysisFilesLoaded;
