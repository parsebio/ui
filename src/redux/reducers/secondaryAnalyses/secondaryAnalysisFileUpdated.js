/* eslint-disable no-param-reassign */
import produce, { original } from 'immer';
import _ from 'lodash';

const secondaryAnalysisFileUpdated = produce((draft, action) => {
  const {
    uploadStatus, fileId, secondaryAnalysisId, percentProgress, abortController,
  } = action.payload;

  if (_.isNil(original(draft[secondaryAnalysisId]?.files)?.data[fileId])) return;

  const { upload: uploadDraft } = draft[secondaryAnalysisId].files.data[fileId];

  uploadDraft.status.current = uploadStatus;
  uploadDraft.percentProgress = percentProgress;

  if (abortController) {
    uploadDraft.abortController = abortController;
  }
});

export default secondaryAnalysisFileUpdated;
