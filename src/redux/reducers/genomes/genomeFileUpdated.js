/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomeFileUpdated = produce((draft, action) => {
  const { fileId, genomeId, diff } = action.payload;

  if (!draft.custom[genomeId]?.files) {
    draft.custom[genomeId].files = {};
  }
  if (!draft.custom[genomeId].files[fileId]) {
    draft.custom[genomeId].files[fileId] = {};
  }
  draft.custom[genomeId].files[fileId] = {
    ...draft.custom[genomeId].files[fileId],
    ...diff,
  };
});

export default genomeFileUpdated;
