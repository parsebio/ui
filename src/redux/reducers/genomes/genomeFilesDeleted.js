/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomeFilesDeleted = produce((draft, action) => {
  const { genomeId, fileIds } = action.payload;
  fileIds.forEach((fileId) => {
    delete draft.custom[genomeId].files[fileId];
  });
});

export default genomeFilesDeleted;
