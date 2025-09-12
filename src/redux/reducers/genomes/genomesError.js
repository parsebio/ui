/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomesError = produce((draft) => {
  draft.error = true;
});

export default genomesError;
