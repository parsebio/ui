import nextConfig from 'next/config';

const getApiEndpoint = (location) => {
  try {
    const url = new URL(location || window.location.href);

    if (url.hostname.includes('staging')) {
      // Arrives as http because our alb's are set up to do SSL termination
      return url.origin.replace('ui', 'api').replace('http://', 'https://');
    }

    if (url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1')) {
      return 'http://localhost:3000';
    }

    const domainName = nextConfig()?.publicRuntimeConfig?.domainName;

    return `https://api.${domainName}`;
  } catch (error) {
    console.error('Failed to get API endpoint.');
    console.error(error);
  }
};

export default getApiEndpoint;
