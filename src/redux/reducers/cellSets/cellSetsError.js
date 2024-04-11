/* eslint-disable no-param-reassign */
import produce from 'immer';

const cellSetsError = produce((draft, action) => {
  console.log('DEB Action received by cellSetsError reducer:', action);

  const { error } = action.payload;
  console.log('DEB Error from action payload:', error);

  draft.loading = false;
  draft.error = error ?? true;

  console.log('DEB Updated draft state in cellSetsError reducer:', draft.loading, draft.error);
});

export default cellSetsError;
