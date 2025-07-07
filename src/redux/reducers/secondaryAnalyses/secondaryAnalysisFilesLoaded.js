/* eslint-disable no-param-reassign */
const { default: produce } = require('immer');

const secondaryAnalysisFilesLoaded = produce((draft, action) => {
  const { files, secondaryAnalysisId, pairMatches } = action.payload;

  const filesDraft = draft[secondaryAnalysisId].files;

  filesDraft.loading = false;

  files.forEach((file) => {
    filesDraft.data[file.id] = file;

    filesDraft.data[file.id].upload.status = {
      current: file.upload.status,
      loading: false,
    };
  });

  filesDraft.pairMatches = pairMatches;
});

export default secondaryAnalysisFilesLoaded;
