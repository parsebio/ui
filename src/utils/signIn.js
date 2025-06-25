import { Auth } from 'aws-amplify';
import Cookies from 'js-cookie';

import cache from 'utils/cache';

const signIn = async () => {
  // Clear old cookies that Amplify might have left behind.
  // This avoids infinite redirect loops when the user tries to sign in
  Object.keys(Cookies.get())
    .filter((key) => key.startsWith('CognitoIdentityServiceProvider.'))
    .forEach((key) => Cookies.remove(key));

  // Store current url so that post-login we can send them to the place they expected
  cache.set('redirectUrl', window.location.href);
  await Auth.federatedSignIn();
};

export default signIn;
