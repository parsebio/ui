import getConfig from 'next/config';
import Cookies from 'js-cookie';

const clearAllCookies = () => {
  const { domainName } = getConfig().publicRuntimeConfig;

  const allCookieKeys = Object.keys(Cookies.get());

  const oldCognitoCookieKeys = allCookieKeys.filter((key) => key.startsWith('CognitoIdentityServiceProvider.'));

  oldCognitoCookieKeys.forEach((key) => {
    Cookies.remove(key, {
      domain: domainName,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
  });
};

export default clearAllCookies;
