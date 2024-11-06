import { Auth } from '@aws-amplify/auth';
import { USER_LOADED, USER_NOT_AUTHENTICATED } from 'redux/actionTypes/user';
import signIn from 'utils/signIn';

const loadUser = () => async (dispatch) => {
  try {
    const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
    console.log("USER is Authenticated!!!!", user);
    dispatch({
      type: USER_LOADED,
      payload: { user },
    });
  } catch (e) {
    console.log("USER not Authenticated!!!");
    dispatch({
      type: USER_NOT_AUTHENTICATED,
    });
    // signIn(true);
  }
};

export default loadUser;
