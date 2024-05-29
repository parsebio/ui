import Auth from '@aws-amplify/auth';
import { USER_LOADED } from 'redux/actionTypes/user';
import handleError from 'utils/http/handleError';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import endUserMessages from 'utils/endUserMessages';

const updateUserAttributes = (user, attributes) => async (dispatch) => {
  try {
    await Auth.updateUserAttributes(user, attributes);
    dispatch({
      type: USER_LOADED,
      payload: { user },
    }); pushNotificationMessage('success', endUserMessages.ACCOUNT_DETAILS_UPDATED, 3);
  } catch (error) {
    handleError(error, error.message);
  }
};

export default updateUserAttributes;
