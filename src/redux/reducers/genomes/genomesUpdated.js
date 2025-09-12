/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomesUpdated = produce((draft, action) => {
  const { genomeId, diff } = action.payload;
  draft.custom[genomeId] = {
    ...draft.custom[genomeId],
    ...diff,
  };
});

export default genomesUpdated;
