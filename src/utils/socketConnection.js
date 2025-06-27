import { Auth } from '@aws-amplify/auth';
import getConfig from 'next/config';
import Cookies from 'js-cookie';
import socketIOClient from 'socket.io-client';

import getApiEndpoint from './apiEndpoint';
import { isBrowser } from './deploymentInfo';

let io;

// Amplify keeps around old cookies, so we need to manually clear them
// to stop the load balancer from dropping the websocket connections
const clearOldCookies = async () => {
  let currentSession;
  try {
    currentSession = await Auth.currentSession();
  } catch (error) {
    // If there is no current session
    if (error.name !== 'NotAuthenticated') {
      console.error('Error getting current session:', error);
    }
    return;
  }

  const { domainName } = getConfig().publicRuntimeConfig;

  const appClientId = currentSession.idToken.payload.aud;

  // Step 1: Get all cookie keys
  const allCookieKeys = Object.keys(Cookies.get());

  // Step 2: Filter for Cognito cookies that do not include the current appClientId
  const oldCognitoCookieKeys = allCookieKeys.filter(
    (key) => key.startsWith('CognitoIdentityServiceProvider.')
      && !key.includes(`.${appClientId}.`),
  );

  // Add . to the beginning?

  // Step 3: Remove each old Cognito cookie
  oldCognitoCookieKeys.forEach((key) => {
    Cookies.remove(key, {
      domain: domainName,
      path: '/',
      secure: true,
      sameSite: 'Strict',
    });
  });

  const newOldCognitoCookieKeys = Object.keys(Cookies.get()).filter(
    (key) => key.startsWith('CognitoIdentityServiceProvider.')
      && !key.includes(`.${appClientId}.`),
  );
  console.log('newOldCognitoCookieKeysDebug', newOldCognitoCookieKeys);
};

const generateIo = () => new Promise((resolve, reject) => {
  io = socketIOClient(
    getApiEndpoint(),
    {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 10,
    },
  );

  io.on('connect', () => {
    // There is a bug where `io.id` is simply not getting assigned straight away
    // even though it should be. We don't know what causes this, so we are just waiting
    // in the callback until an `id` property is found in the object.
    const interval = setInterval(() => {
      if (!io.id) {
        return;
      }

      clearInterval(interval);
      resolve(io);
    }, 10);
  });

  io.on('error', (error) => {
    console.error('io.on error');
    console.error(error);
    io.close();
    reject(error);
  });

  io.on('connect_error', (error) => {
    console.error('io.on connect_error');
    console.error(error);
    io.close();
    reject(error);
  });
});

const socketConnection = async () => {
  /**
  * You likely added a static `import ... from socketConnection.js` to the top of a file.
  * These files are automatically run and evaluted at build-time and during SSR-time.
  * This means the server or your development machine will attempt and fail to connect to the API.
  *
  * To avoid this, imports like these are blocked. You must use `async import()` to dynamically
  * import the promise as necessary during runtime.
  */
  if (!isBrowser) {
    throw new Error(
      'connectionPromise attempted to run on the server. It must be used through a dynamic import. Search in the code for this error for more details.',
    );
  }

  if (io) return io;

  try {
    io = await generateIo();
  } catch (e) {
    await clearOldCookies();
    io = await generateIo();
  }

  return io;
};

export default socketConnection;
