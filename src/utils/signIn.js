import { Auth } from 'aws-amplify';
import Cookies from 'js-cookie';

import cache from 'utils/cache';

const signIn = async () => {
  const cookies = Cookies.get();
  console.log('cookiesDebug');
  console.log(cookies);

  const cookiesKeys = Object.keys(cookies);
  console.log('ObjectkeyscookiesKeysDebug');
  Object.keys(cookiesKeys);
  // Clear old cookies that Amplify might have left behind.
  // This avoids infinite redirect loops when the user tries to sign in
  const filteredCookies = cookiesKeys
    .filter((key) => key.startsWith('CognitoIdentityServiceProvider.'));

  console.log('filteredCookiesDebug');
  console.log(filteredCookies);

  filteredCookies.forEach((key) => Cookies.remove(key));

  // Store current url so that post-login we can send them to the place they expected
  cache.set('redirectUrl', window.location.href);
  await Auth.federatedSignIn();
};

export default signIn;
