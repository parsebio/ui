import APIError from 'utils/errors/http/APIError';
import FetchError from 'utils/errors/http/FetchError';
import getApiEndpoint from 'utils/apiEndpoint';
import getAuthJWT from 'utils/getAuthJWT';
import { notAgreedToTermsStatus } from 'utils/constants';
import { loadUser } from 'redux/actions/user';

let dispatch;

const setUpDispatch = (dispatchParam) => {
  dispatch = dispatchParam;
};

const fetchAPI = async (path, params = {}, extras = {}) => {
  const headers = params.headers ? params.headers : {};
  const authJWT = extras.jwt || await getAuthJWT();
  const parseJson = extras.parseJson ?? true;

  console.log('authJWTDebug');
  console.log(authJWT);

  console.log('extrasDebug');
  console.log(extras);

  const parameters = {
    ...params,
    headers: {
      ...headers,
      ...(authJWT && { Authorization: `Bearer ${authJWT}` }),
    },
  };

  console.log('parametersPreDebug');
  console.log(JSON.stringify(parameters));

  parameters.headers.Authorization = authJWT;
  parameters.headers.authorization = authJWT;

  console.log('parametersPostDebug');
  console.log(JSON.stringify(parameters));

  const url = getApiEndpoint(extras.uiUrl) + path;

  let response;
  try {
    response = await fetch(url, parameters);
  } catch (e) {
    // wrap fetch errors in custom error
    throw new FetchError(e);
  }
  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // if we can't get extra error info from the response we don't want to fail
      // just return the error code, this happens in many tests
      // where we mock a string response instead of proper json
    }

    // If the user didn't agree to the terms of use,
    // Reload the user so that we trigger the TermsOfUseIntercept
    if (response.status === notAgreedToTermsStatus) {
      dispatch(loadUser());
    }

    // data.message & data.errors follow error formatting defined in:
    // HTTPError.v1.yaml
    throw new APIError(response.status, data?.message, data?.errors);
  }

  if (!parseJson) return response;

  return await response.json();
};

export default fetchAPI;
export { setUpDispatch };
