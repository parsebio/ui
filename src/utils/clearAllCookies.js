import { Auth } from '@aws-amplify/auth';
import getConfig from 'next/config';
import Cookies from 'js-cookie';

const clearAllCookies = async () => {
  let currentSession;
  try {
    currentSession = await Auth.currentSession();
  } catch (error) {
    // If there is no current session
    if (error.name !== 'NotAuthenticated') {
      console.error('Error getting current session:', error);
    }
    return;
  }

  const { domainName } = getConfig().publicRuntimeConfig;

  const appClientId = currentSession.idToken.payload.aud;

  const allCookieKeys = Object.keys(Cookies.get());

  const oldCognitoCookieKeys = allCookieKeys.filter(
    (key) => key.startsWith('CognitoIdentityServiceProvider.')
      && !key.includes(`.${appClientId}.`),
  );

  oldCognitoCookieKeys.forEach((key) => {
    Cookies.remove(key, {
      domain: domainName,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
  });
};
