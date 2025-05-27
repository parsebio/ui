import getAWSRegion from './getAWSRegion';

const configure = (userPoolId, identityPoolId, userPoolClientDetails) => {
  const redirectProtocol = (process.env.NODE_ENV === 'development') ? 'http:' : 'https:';
  const usingProtocol = (url) => url.startsWith(redirectProtocol);

  const callbackURLs = userPoolClientDetails.CallbackURLs.filter(usingProtocol);
  const signInRedirect = callbackURLs.find((url) => url.endsWith('/redirect')) ?? callbackURLs[0];

  const signOutRedirect = userPoolClientDetails.LogoutURLs.filter(usingProtocol)[0];

  console.log('userPoolClientDetailsDebug');
  console.log(userPoolClientDetails);

  console.log('processenvDOMAIN_NAMEDEbug');
  console.log(process.env.DOMAIN_NAME);
  console.log('processenvNODE_ENVDebug');
  console.log(process.env.NODE_ENV);

  const authConfig = {
    Auth: {
      region: getAWSRegion(),
      identityPoolId,
      userPoolId,
      userPoolWebClientId: userPoolClientDetails.ClientId,
      mandatorySignIn: false,
      authenticationFlowType: 'USER_SRP_AUTH',
      oauth: {
        domain: userPoolClientDetails.Domain,
        scope: userPoolClientDetails.AllowedOAuthScopes,
        redirectSignIn: signInRedirect,
        redirectSignOut: signOutRedirect,
        responseType: userPoolClientDetails.AllowedOAuthFlows[0],
      },
    },
  };

  return (
    { ...authConfig }
  );
};

export default configure;
