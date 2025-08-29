/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomeFileUpdated = produce((draft, action) => {
  const { fileId, genomeId, diff } = action.payload;
  if (!draft[genomeId]?.files) {
    draft[genomeId].files = {};
  }
  if (!draft[genomeId].files[fileId]) {
    draft[genomeId].files[fileId] = {};
  }
  draft[genomeId].files[fileId] = {
    ...draft[genomeId].files[fileId],
    ...diff,
  };
});

export default genomeFileUpdated;
