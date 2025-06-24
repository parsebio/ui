import { Auth } from '@aws-amplify/auth';

import cache from 'utils/cache';

const signIn = async () => {
  // Store current url so that post-login we can send them to the place they expected
  cache.set('redirectUrl', window.location.href);
  await Auth.federatedSignIn();
};

export default signIn;
