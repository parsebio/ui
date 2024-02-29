import produce from 'immer';

const secondaryAnalysisFileUpdated = produce((draft, action) => {
  const {
    uploadStatus, percentProgress, fileId, secondaryAnalysisId,
  } = action.payload;
  draft[secondaryAnalysisId].files.data[fileId].upload = { status: uploadStatus, percentProgress };
});

export default secondaryAnalysisFileUpdated;
