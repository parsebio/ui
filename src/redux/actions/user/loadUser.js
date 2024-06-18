import Auth from '@aws-amplify/auth';
import { USER_LOADED } from 'redux/actionTypes/user';
import signIn from 'utils/signIn';

const loadUser = () => async (dispatch) => {
  try {
    const user = await Auth.currentAuthenticatedUser({ bypassCache: true });

    dispatch({
      type: USER_LOADED,
      payload: { user },
    });
  } catch (e) {
    signIn();
  }
};

export default loadUser;
