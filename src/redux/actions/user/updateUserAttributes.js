import { Auth } from '@aws-amplify/auth';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import loadUser from './loadUser';

const updateUserAttributes = (user, attributes, onError = () => {}) => async (dispatch) => {
  try {
    await Auth.updateUserAttributes(user, attributes);
    await dispatch(loadUser());
  } catch (error) {
    pushNotificationMessage('error', 'Something went wrong while updating your account details', 3);
    onError();
  }
};

export default updateUserAttributes;
