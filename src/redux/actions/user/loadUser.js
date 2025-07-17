import { Auth } from '@aws-amplify/auth';

import { USER_LOADED } from 'redux/actionTypes/user';
import clearAllCookies from 'utils/clearAllCookies';
import signIn from 'utils/signIn';

const loadUser = () => async (dispatch) => {
  try {
    let user = await Auth.currentAuthenticatedUser();

    if (!user.attributes) {
      clearAllCookies();
      user = Auth.currentAuthenticatedUser({ bypassCache: true });
      return;
    }

    dispatch({
      type: USER_LOADED,
      payload: { user },
    });
  } catch (e) {
    signIn();
  }
};

export default loadUser;
