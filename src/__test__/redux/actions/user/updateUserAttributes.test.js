import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Auth } from '@aws-amplify/auth';
import updateUserAttributes from 'redux/actions/user/updateUserAttributes';
import loadUser from 'redux/actions/user/loadUser';
import pushNotificationMessage from 'utils/pushNotificationMessage';

jest.mock('@aws-amplify/auth', () => ({
  Auth: {
    updateUserAttributes: jest.fn(),
  },
}));

jest.mock('utils/pushNotificationMessage');
jest.mock('redux/actions/user/loadUser');

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('updateUserAttributes', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  it('dispatches loadUser on successful update', async () => {
    Auth.updateUserAttributes = jest.fn().mockResolvedValueOnce();
    const user = { username: 'testUser' };
    const attributes = { email: 'test@example.com' };

    // Mock the loadUser action creator
    loadUser.mockReturnValue({ type: 'LOAD_USER_SUCCESS' });

    await store.dispatch(updateUserAttributes(user, attributes));

    expect(Auth.updateUserAttributes).toHaveBeenCalledWith(user, attributes);
    expect(store.getActions()).toContainEqual({ type: 'LOAD_USER_SUCCESS' });
  });

  it('handles errors and calls onError callback', async () => {
    const error = new Error('Failed to update');
    Auth.updateUserAttributes = jest.fn().mockRejectedValueOnce(error);
    const onError = jest.fn();

    await store.dispatch(updateUserAttributes({}, {}, onError));

    expect(pushNotificationMessage).toHaveBeenCalledWith('error', 'Something went wrong while updating your account details', 3);
    expect(onError).toHaveBeenCalled();
  });
});
