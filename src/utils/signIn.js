import { Auth } from '@aws-amplify/auth';

import cache from 'utils/cache';

const signIn = async (isFederated) => {
  // Store current url so that post-login we can send them to the place they expected
  cache.set('redirectUrl', window.location.href);
  console.log("**** I am hit, hello! ", window.location.href);
  if (isFederated) {
    // await Auth.federatedSignIn();
    await Auth.federatedSignIn({ customProvider: 'ParseCustomerLogin' });
  }
  else {
    await Auth.federatedSignIn();
  }
};

export default signIn;
