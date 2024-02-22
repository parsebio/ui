const { default: produce } = require('immer');

const secondaryAnalysisFilesLoaded = produce((draft, action) => {
  const { files } = action.payload;

  draft.files = {
    loading: false,
    error: null,
    data: files,
  };
});

export default secondaryAnalysisFilesLoaded;
