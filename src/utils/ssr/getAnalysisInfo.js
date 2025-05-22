import _ from 'lodash';

import { storeLoadedAnalysis } from 'redux/actions/secondaryAnalyses';

import fetchAPI from 'utils/http/fetchAPI';
import APIError from 'utils/errors/http/APIError';
import httpStatusCodes from 'utils/http/httpStatusCodes';

const getAnalysisInfo = async (context, store, Auth) => {
  const { req, query } = context;
  const { secondaryAnalysisId } = query;

  if (store.getState().apiUrl) return;

  let user;
  try {
    user = await Auth.currentAuthenticatedUser();
  } catch (e) {
    if (e === 'The user is not authenticated') {
      throw new APIError(httpStatusCodes.UNAUTHORIZED);
    }
    throw e;
  }

  const jwt = user.getSignInUserSession().getIdToken().getJwtToken();

  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  const secondaryAnalysis = await fetchAPI(
    `/v2/secondaryAnalysis/${secondaryAnalysisId}`,
    {},
    { uiUrl: url, jwt },
  );

  const secondaryAnalysisForRedux = _.cloneDeep(secondaryAnalysis);

  secondaryAnalysisForRedux.status = {
    logs: {},
    loading: false,
    error: false,
    ...secondaryAnalysis.status,
  };

  store.dispatch(storeLoadedAnalysis(secondaryAnalysisForRedux));
  return {};
};

export default getAnalysisInfo;
