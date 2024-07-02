/* eslint-disable no-param-reassign */
const { default: produce } = require('immer');

const secondaryAnalysisFilesLoaded = produce((draft, action) => {
  const { files, secondaryAnalysisId } = action.payload;
  draft[secondaryAnalysisId].files.loading = false;

  files.forEach((file) => {
    draft[secondaryAnalysisId].files.data[file.id] = {
      ...draft[secondaryAnalysisId].files.data[file.id],
      ...file,
    };

    draft[secondaryAnalysisId].files.data[file.id].upload.status = {
      current: file.upload.status,
      loading: false,
    };
  });
});

export default secondaryAnalysisFilesLoaded;
