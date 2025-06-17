import { Auth } from 'aws-amplify';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import endUserMessages from 'utils/endUserMessages';
import loadUser from './loadUser';

const updateUserAttributes = (user, attributes, onError = () => { }) => async (dispatch) => {
  try {
    await Auth.updateUserAttributes(user, attributes);
    await dispatch(loadUser());
    pushNotificationMessage('success', endUserMessages.ACCOUNT_DETAILS_UPDATED, 3);
  } catch (error) {
    pushNotificationMessage('error', 'Something went wrong while updating your account details', 3);
    onError();
  }
};

export default updateUserAttributes;
