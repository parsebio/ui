import React from 'react';

import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { makeStore } from 'redux/store';
import createTestComponentFactory from '__test__/test-utils/testComponentFactory';
import { Auth } from '@aws-amplify/auth';

import ProfileSettings from 'pages/settings/profile';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import { Provider } from 'react-redux';
import { cognitoMFA, cookiesAgreedCognitoKey } from 'const';
import { loadUser } from 'redux/actions/user';
import loadDeploymentInfo from 'redux/actions/networkResources/loadDeploymentInfo';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
  __esModule: true,
}));
jest.mock('@aws-amplify/auth', () => ({
  Auth: jest.fn(),
}));
jest.mock('@aws-amplify/ui', () => ({
  totpQrcode: jest.fn(),
}));
jest.mock('utils/pushNotificationMessage');

const mockSetupKey = 'mock-setup-key';

const updateMock = jest.fn(() => Promise.resolve(true));

const user = { attributes: { 'custom:agreed_cookies_v1': 'true', 'custom:agreed_terms_v2': 'true', name: 'Arthur Dent' } };

const profileSettingsPageFactory = createTestComponentFactory(ProfileSettings);

const renderProfileSettingsPage = (store, newState = {}) => {
  render(
    <Provider store={store}>
      {profileSettingsPageFactory(newState)}
    </Provider>,
  );
};

const setUpAuthMocks = (mfaType = cognitoMFA.disabled) => {
  Auth.currentAuthenticatedUser = jest.fn(() => Promise.resolve({
    attributes: {
      name: userName,
      'custom:agreed_terms_v2': 'true',
      'custom:agreed_cookies_v1': 'true',

    },
  }));
  Auth.signOut = jest.fn(() => { });
  Auth.federatedSignIn = jest.fn(() => { });
  Auth.updateUserAttributes = updateMock;
  Auth.getPreferredMFA = jest.fn(() => Promise.resolve(mfaType));
  Auth.setupTOTP = jest.fn(() => Promise.resolve(mockSetupKey));
  Auth.verifyTotpToken = jest.fn(() => Promise.resolve());
  Auth.setPreferredMFA = jest.fn(() => Promise.resolve());
};

const userName = 'Arthur Dent';

describe('Profile page', () => {
  const store = makeStore();

  beforeEach(async () => {
    jest.clearAllMocks();

    setUpAuthMocks();

    store.dispatch(loadDeploymentInfo({ environment: 'test' }));
    store.dispatch(loadUser());
  });

  it('resetCookiesPreferences calls updateUserAttributes and deletes cookies', async () => {
    document.cookie = 'username=John Doe';
    const cookiesSpy = jest.spyOn(document, 'cookie', 'set');

    await act(async () => {
      renderProfileSettingsPage(store);
    });

    await act(async () => {
      userEvent.click(screen.getByText('Reset Cookies Preferences'));
    });

    expect(Auth.updateUserAttributes).toHaveBeenCalledWith(
      expect.anything(),
      { [cookiesAgreedCognitoKey]: '' },
    );

    expect(cookiesSpy).toHaveBeenCalledWith(expect.stringMatching(/^username=;expires=Thu, 01 Jan 1970 00:00:00 GMT/));
    expect(document.cookie).toEqual('');
  });

  it('check that the back button is called on cancel', async () => {
    const backMock = jest.fn();
    useRouter.mockImplementation(() => ({
      back: backMock,
    }));

    await act(async () => {
      renderProfileSettingsPage(store);
    });

    await act(async () => {
      userEvent.click(screen.getByText('Cancel'));
    });

    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it('check update is called on Save changes', async () => {
    await act(async () => {
      renderProfileSettingsPage(store);
    });

    const nameInput = screen.getByPlaceholderText(userName);
    await act(async () => {
      userEvent.type(nameInput, 'JX Name Man');
    });
    await act(async () => {
      userEvent.click(screen.getByText('Save changes'));
    });

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(pushNotificationMessage).toHaveBeenCalledTimes(1);
  });

  const enableMFA = async () => {
    await act(async () => {
      renderProfileSettingsPage(store);
    });

    await act(async () => {
      userEvent.click(screen.getByText('Enable MFA'));
    });

    // Shows modal
    expect(screen.getByText('Scan the qr code')).toBeInTheDocument();
    expect(screen.getByText('Enter the 6 digit code (token) your application shows')).toBeInTheDocument();

    // Shows the loaded setup key
    expect(screen.getByText(mockSetupKey)).toBeInTheDocument();

    const codeVerifyInput = screen.getByPlaceholderText('Enter code here');

    // Write code to verify
    await act(async () => {
      userEvent.type(codeVerifyInput, '123456');
    });

    // Click button to verify
    await act(async () => {
      userEvent.click(screen.getByText('Verify Security Token'));
    });
  };

  it('Can enable MFA', async () => {
    await enableMFA();

    expect(Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
    expect(Auth.verifyTotpToken).toHaveBeenCalledWith(user, '123456');

    expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(1);
    expect(Auth.setPreferredMFA).toHaveBeenCalledWith(user, cognitoMFA.enabled);
  });

  it('Handles MFA enable failure with wrong code input', async () => {
    Auth.verifyTotpToken
      .mockReset()
      .mockImplementation(() => Promise.reject(new Error('Code mismatch')));

    await enableMFA();

    expect(Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
    expect(Auth.verifyTotpToken).toHaveBeenCalledWith(user, '123456');

    expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(0);

    expect(screen.getByText('Invalid code, please check the six-digit code is correct and try again. If the problem persists, try setting up the account again.')).toBeInTheDocument();
  });

  it('Handles MFA enable failure with random error', async () => {
    Auth.verifyTotpToken
      .mockReset()
      .mockImplementation(() => Promise.reject(new Error('Random error')));

    await enableMFA();

    expect(Auth.verifyTotpToken).toHaveBeenCalledTimes(1);
    expect(Auth.verifyTotpToken).toHaveBeenCalledWith(user, '123456');

    expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(0);

    expect(screen.getByText('An unexpected error happened, please try again. If the problem persists, contact support.')).toBeInTheDocument();
  });

  it('Can disable MFA', async () => {
    // Make mfa begin as enabled
    Auth.mockReset();
    setUpAuthMocks(cognitoMFA.enabled);

    await act(async () => {
      renderProfileSettingsPage(store);
    });

    await act(async () => {
      userEvent.click(screen.getByText('Disable MFA'));
    });

    // Are you sure pops up
    expect(screen.getByText('Are you sure you want to disable MFA?')).toBeInTheDocument();

    // Click confirm
    await act(async () => {
      userEvent.click(screen.getByText('Yes'));
    });

    expect(Auth.setPreferredMFA).toHaveBeenCalledTimes(1);
    expect(Auth.setPreferredMFA).toHaveBeenCalledWith(user, cognitoMFA.disabled);
  });
});
