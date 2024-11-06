/* eslint-disable no-param-reassign */
import produce from 'immer';

const userLoaded = produce((draft, action) => {
  const { user } = action.payload;
  draft.current = user;
  draft.isAuthenticated = true;
});

export default userLoaded;
