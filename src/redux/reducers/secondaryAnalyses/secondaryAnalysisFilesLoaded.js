const { default: produce } = require('immer');

const secondaryAnalysisFilesLoaded = produce((draft, action) => {
  const { files, secondaryAnalysisId } = action.payload;
  files.forEach((file) => {
    draft[secondaryAnalysisId].files[file.id] = file;
  });
});

export default secondaryAnalysisFilesLoaded;
