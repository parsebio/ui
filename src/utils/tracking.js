import { init, push } from '@socialgouv/matomo-next';
import { Auth } from '@aws-amplify/auth';
import { Environment } from './deploymentInfo';
import fetchAPI from './http/fetchAPI';

const MATOMO_URL = 'https://biomage.matomo.cloud';

// To test a staging deployment, you'll need to go to matomo.cloud
// and change the URL there to point to your staging env URL.
// To test locally, just enable the development environemnt.
// The Site Ids are defined in matomo.cloud
const trackingInfo = {
  [Environment.PRODUCTION]: {
    enabled: true,
    siteId: 1,
    containerId: 'lkIodjnO',
  },
  [Environment.STAGING]: {
    enabled: true,
    siteId: 2,
    containerId: 'FX7UBNS6',
  },
  [Environment.DEVELOPMENT]: {
    enabled: true,
    siteId: 3,
    containerId: 'lS8ZRMXJ',
  },
};

let env = Environment.DEVELOPMENT;

const getTrackingDetails = (e) => ({ ...trackingInfo[e] });

const initTracking = async (environment, cookiesEnabled) => {
  // set the environment for the tracking sytem
  env = environment;
  const { siteId, enabled } = getTrackingDetails(env);
  if (enabled === false) {
    return;
  }

  const user = await Auth.currentAuthenticatedUser();

  // send the user activity manually to the tracking system
  // as well in case it is blocked by the browser or adblock
  const userActivityBody = {
    email: user.attributes.email,
    siteId,
  };
  await fetchAPI('/v2/user/tracking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userActivityBody),
  });

  // first set the user ID and then initialize the tracking so it correctly tracks first page.
  push(['setUserId', user.attributes.email]);
  init({ url: MATOMO_URL, siteId, disableCookies: !cookiesEnabled });
};

// reset the user ID when loggging out
const resetTrackingId = () => {
  const { enabled } = getTrackingDetails(env);
  if (enabled === false) {
    return;
  }

  push(['resetUserId']);
  // we also force a new visit to be created for the pageviews after logout
  push(['appendToTrackingUrl', 'new_visit=1']);
};

export {
  initTracking, resetTrackingId, getTrackingDetails,
};
