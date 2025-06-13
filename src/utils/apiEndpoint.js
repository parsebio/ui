import nextConfig from 'next/config';

const getApiEndpoint = (location) => {
  try {
    console.log('locationDebug');
    console.log(location);
    const url = new URL(location || window.location.href);

    console.log('urlhostnameDebug');
    console.log(url.hostname);

    console.log('urlOriginDebug');
    console.log(url.origin);

    if (url.hostname.includes('staging')) {
      return url.origin.replace('ui', 'api').replace('http://', 'https://');
    }

    if (url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1')) {
      return 'http://localhost:3000';
    }

    const domainName = nextConfig()?.publicRuntimeConfig?.domainName;

    console.log('domainNameDebug');
    console.log(domainName);

    return `https://api.${domainName}`;
  } catch (error) {
    console.error('Failed to get API endpoint.');
    console.error(error);
  }
};

export default getApiEndpoint;
