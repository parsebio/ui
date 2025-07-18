import { Auth } from '@aws-amplify/auth';

import { USER_LOADED } from 'redux/actionTypes/user';
import clearCognitoCookies from 'utils/clearCognitoCookies';
import signIn from 'utils/signIn';

const loadUser = () => async (dispatch) => {
  try {
    clearCognitoCookies();
    let user = await Auth.currentAuthenticatedUser();

    if (!user.attributes) {
      user = Auth.currentAuthenticatedUser({ bypassCache: true });
      return;
    }

    dispatch({
      type: USER_LOADED,
      payload: { user },
    });
  } catch (e) {
    console.error(e);
    signIn();
  }
};

export default loadUser;
