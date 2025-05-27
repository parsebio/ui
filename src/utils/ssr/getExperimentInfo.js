import fetchAPI from 'utils/http/fetchAPI';
import updateExperimentInfo from 'redux/actions/experimentSettings/updateExperimentInfo';

import APIError from 'utils/errors/http/APIError';
import httpStatusCodes from 'utils/http/httpStatusCodes';

const toApiV1 = (experimentV2) => {
  const {
    id, name, samplesOrder, pipelines, ...restOfExperiment
  } = experimentV2;

  const pipelinesV1 = {
    gem2s: pipelines.gem2s,
    pipeline: pipelines.qc,
  };

  const experimentV1 = {
    ...restOfExperiment,
    experimentId: id,
    experimentName: name,
    projectId: id,
    sampleIds: samplesOrder,
    meta: pipelinesV1,
    // These are always created with the same value right now
    // when the UI is updated:
    //  - Organism is not going to be used anymore.
    //  - Type will be defined in the samples, not in the experiment.
    organism: null,
    type: '10x',
  };

  return experimentV1;
};

const getExperimentInfo = async (context, store, Auth) => {
  const { req, query } = context;
  const { experimentId } = query;

  console.log('getExperimentInfoDebug1');
  if (
    store.getState().apiUrl
    && store.getState().experimentSettings.info.experimentId === experimentId
  ) {
    return;
  }

  console.log('getExperimentInfoDebug2');

  let user;
  console.log('getExperimentInfoDebug3');
  try {
    user = await Auth.currentAuthenticatedUser();
    console.log('getExperimentInfoDebug4');
  } catch (e) {
    if (e === 'The user is not authenticated') {
      throw new APIError(httpStatusCodes.UNAUTHORIZED);
    }
    throw e;
  }
  console.log('getExperimentInfoDebug5');

  const signInUserSessionJwt = user.getSignInUserSession().getIdToken().getJwtToken();

  console.log('getSignInUserSessionjwtIdDebug');
  console.log(signInUserSessionJwt);

  const currentSessionIdJwtToken = Auth.currentSession().getIdToken().getJwtToken();
  console.log('getExperimentInfoDebug6');

  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log('getExperimentInfoDebug7');

  let experimentDataV2;
  try {
    experimentDataV2 = await fetchAPI(
      `/v2/experiments/${experimentId}`,
      {},
      { uiUrl: url, jwt: signInUserSessionJwt },
    );
  } catch (e) {
    console.error('signInUserSessionJwt failed');
  }

  try {
    experimentDataV2 = await fetchAPI(
      `/v2/experiments/${experimentId}`,
      {},
      { uiUrl: url, jwt: currentSessionIdJwtToken },
    );
  } catch (e) {
    console.error('currentSessionIdJwtToken failed');
  }

  if (!experimentDataV2) {
    throw new Error('Still not working after trying both JWTs');
  }
  console.log('getExperimentInfoDebug8');

  const experimentData = toApiV1(experimentDataV2);
  console.log('getExperimentInfoDebug9');

  store.dispatch(updateExperimentInfo(experimentData));
  console.log('getExperimentInfoDebug10');
  return {};
};

export default getExperimentInfo;
