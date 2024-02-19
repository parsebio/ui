/* eslint-disable no-param-reassign */

import produce, { original } from 'immer';

const secondaryAnalysisDeleted = produce((draft, action) => {
  const { secondaryAnalysisIds } = action.payload;
  const originalState = original(draft);

  const newIds = originalState.ids.filter((id) => !secondaryAnalysisIds.includes(id));

  draft.ids = newIds;
  draft.meta.saving = false;
  secondaryAnalysisIds.forEach((id) => {
    // eslint-disable-next-line no-param-reassign
    delete draft[id];
  });
});

export default secondaryAnalysisDeleted;
