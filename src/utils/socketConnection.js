import { Auth } from '@aws-amplify/auth';
import Cookies from 'js-cookie';

import socketIOClient from 'socket.io-client';
import getApiEndpoint from './apiEndpoint';
import { isBrowser } from './deploymentInfo';

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

  const appClientId = currentSession.idToken.payload.aud;

  Object.keys(Cookies.get())
    .filter((key) => key.startsWith('CognitoIdentityServiceProvider.') && !key.includes(`.${appClientId}.`))
    .forEach((key) => Cookies.remove(key));
};

const connectionPromise = new Promise((resolve, reject) => {
  const io = socketIOClient(
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

  await clearOldCookies();
  return await connectionPromise;
};

export default socketConnection;
