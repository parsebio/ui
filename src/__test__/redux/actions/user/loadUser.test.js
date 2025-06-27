import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'jest-fetch-mock';
import { loadUser } from 'redux/actions/user';
import { USER_LOADED } from 'redux/actionTypes/user';
import signIn from 'utils/signIn';
import { Auth } from '@aws-amplify/auth';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('utils/signIn');
jest.mock('aws-amplify', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn().mockImplementation(async () => ({
      attributes: {
        'custom:agreed_terms_v2': 'true',
        'custom:agreed_cookies_v1': 'true',
        name: 'Tester Testson',
      },
    })),
    federatedSignIn: jest.fn(),
  },
}));

describe('loadUser action', () => {
  let store;

  beforeEach(() => {
    fetchMock.enableMocks();
    store = mockStore({});
  });

  afterEach(() => {
    fetchMock.disableMocks();
    fetchMock.resetMocks();
  });

  it('dispatches USER_LOADED when user is successfully loaded', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ user: { name: 'Test User' } }));

    await store.dispatch(loadUser());

    const actions = store.getActions();
    expect(actions[0].type).toEqual(USER_LOADED);
    expect(actions[0].payload).toMatchSnapshot();
  });

  it('handles exceptions by not dispatching USER_LOADED', async () => {
    Auth.currentAuthenticatedUser = jest.fn().mockImplementationOnce(async () => {
      throw new Error('Failed to fetch');
    });

    await store.dispatch(loadUser());

    const actions = store.getActions();
    expect(signIn).toHaveBeenCalled();
    expect(actions).toEqual([]);
  });
});
