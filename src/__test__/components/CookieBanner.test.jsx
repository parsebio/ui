import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import CookieBanner from 'components/CookieBanner';
import { cookiesAgreedCognitoKey } from 'utils/constants';
import Auth from '@aws-amplify/auth';

// Mock AWS Amplify Auth
jest.mock('@aws-amplify/auth', () => ({
  updateUserAttributes: jest.fn(),
}));

const mockStore = configureMockStore();
const store = mockStore({
  user: {
    current: {
      attributes: {
        [cookiesAgreedCognitoKey]: undefined,
      },
    },
  },
});

describe('CookieBanner', () => {
  it('renders correctly and can accept cookies', () => {
    render(
      <Provider store={store}>
        <CookieBanner />
      </Provider>,
    );

    // Check if the banner is visible
    expect(screen.getByText(/We use cookies to improve your experience/i)).toBeInTheDocument();

    // Simulate accepting cookies
    fireEvent.click(screen.getByText('Accept All'));

    // Expect the updateUserAttributes to be called with true
    expect(Auth.updateUserAttributes).toHaveBeenCalledWith(expect.anything(), {
      [cookiesAgreedCognitoKey]: 'true',
    });
  });

  it('renders correctly and can reject cookies', () => {
    render(
      <Provider store={store}>
        <CookieBanner />
      </Provider>,
    );

    // Check if the banner is visible
    expect(screen.getByText(/We use cookies to improve your experience/i)).toBeInTheDocument();

    // Simulate rejecting cookies
    fireEvent.click(screen.getByText('Reject'));

    // Expect the updateUserAttributes to be called with false
    expect(Auth.updateUserAttributes).toHaveBeenCalledWith(expect.anything(), {
      [cookiesAgreedCognitoKey]: 'false',
    });
  });

  it('Opens customize modal and interacts with cookie settings', () => {
    render(
      <Provider store={store}>
        <CookieBanner />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Customize'));
    expect(screen.getByText('Cookie Settings')).toBeInTheDocument();
    expect(screen.getByText('Essential Cookies')).toBeInTheDocument();
    expect(screen.getByText('Other cookies and Session Replay Technology')).toBeInTheDocument();

    // Simulate accepting all cookies
    fireEvent.click(screen.getAllByText('Accept All')[0]);
    expect(Auth.updateUserAttributes).toHaveBeenCalledWith(expect.anything(), {
      [cookiesAgreedCognitoKey]: 'true',
    });
  });
});
