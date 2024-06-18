import nextConfig from 'next/config';

const accountId = nextConfig()?.publicRuntimeConfig?.accountId;

const accountInfo = {
  default: {
    supportEmail: 'hello@biomage.net',
  },
};

const getAccountInfo = (account) => accountInfo[account] || accountInfo.default;

const config = {
  supportEmail: getAccountInfo(accountId).supportEmail,
  pipelineVersionToRerunQC: 2,
  workerVersion: 4, // needs to match workerVersion in API
};

export default config;
