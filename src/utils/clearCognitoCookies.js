import getConfig from 'next/config';
import Cookies from 'js-cookie';

const clearCognitoCookies = () => {
  const { domainName } = getConfig().publicRuntimeConfig;

  const allCookieKeys = Object.keys(Cookies.get());

  const cognitoCookieKeys = allCookieKeys.filter((key) => key.startsWith('CognitoIdentityServiceProvider.'));

  cognitoCookieKeys.forEach((key) => {
    Cookies.remove(key, {
      domain: domainName,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
  });
};

export default clearCognitoCookies;
