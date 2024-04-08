/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisFileUpdated = produce((draft, action) => {
  const {
    uploadStatus, fileId, secondaryAnalysisId, percentProgress, abortController,
  } = action.payload;

  const { upload: uploadDraft } = draft[secondaryAnalysisId].files.data[fileId];

  uploadDraft.status.current = uploadStatus;
  uploadDraft.percentProgress = percentProgress;

  if (abortController) {
    uploadDraft.abortController = abortController;
  }
});

export default secondaryAnalysisFileUpdated;
