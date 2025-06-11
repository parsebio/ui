import APIError from 'utils/errors/http/APIError';
import FetchError from 'utils/errors/http/FetchError';
import getApiEndpoint from 'utils/apiEndpoint';
import getAuthJWT from 'utils/getAuthJWT';
import { notAgreedToTermsStatus } from 'utils/constants';
import { loadUser } from 'redux/actions/user';
import axios from 'axios';

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
      ...(authJWT && { authorization: `Bearer ${authJWT}` }),
    },
  };

  console.log('parametersPostDebug');
  console.log(JSON.stringify(parameters));

  const url = getApiEndpoint(extras.uiUrl) + path;

  let response;
  try {
    axios.interceptors.request.use((request) => {
      console.log(`FullRequestDebug: ${JSON.stringify(request)}]}`);
      return request;
    });

    response = await axios({
      url,
      method: params.method || 'GET',
      headers: parameters.headers,
      data: params.body,
      // You can add more axios config here if needed
    });
  } catch (e) {
    // wrap axios errors in custom error
    throw new FetchError(e);
  }
  // Axios puts the status on response.status and data on response.data
  if (!response.status || response.status < 200 || response.status >= 300) {
    const { data } = response;
    // If the user didn't agree to the terms of use,
    // Reload the user so that we trigger the TermsOfUseIntercept
    if (response.status === notAgreedToTermsStatus) {
      dispatch(loadUser());
    }
    throw new APIError(response.status, data?.message, data?.errors);
  }

  if (!parseJson) return response;

  return response.data;
};

export default fetchAPI;
export { setUpDispatch };
