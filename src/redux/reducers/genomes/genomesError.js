/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomesError = produce((draft, action) => {
  const { error } = action.payload;
  draft.error = error;
});

export default genomesError;
