import endUserMessages from 'utils/endUserMessages';

import {
  SAMPLES_BULK_KIT_UPDATE, SAMPLES_SAVING, SAMPLES_SAVED, SAMPLES_ERROR,
} from 'redux/actionTypes/samples';

import handleError from 'utils/http/handleError';
import fetchAPI from 'utils/http/fetchAPI';
import { loadBackendStatus } from '../backendStatus';

const bulkUpdateSampleKits = (sampleIds, kit) => async (dispatch, getState) => {
  const parseSampleIds = sampleIds.filter((sampleId) => getState().samples[sampleId].type === 'parse');
  if (parseSampleIds.length === 0) {
    throw new Error('parse sampleIds array cannot be empty');
  }

  // In api v2 experimentId and experimentId are the same
  const { experimentId } = getState().samples[sampleIds[0]];
  const url = `/v2/experiments/${experimentId}/samples/kit`;
  const body = { sampleIds: parseSampleIds, kit };

  dispatch({
    type: SAMPLES_SAVING,
    payload: {
      message: endUserMessages.SAVING_SAMPLE,
    },
  });

  try {
    await fetchAPI(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    dispatch({
      type: SAMPLES_SAVED,
    });

    dispatch({
      type: SAMPLES_BULK_KIT_UPDATE,
      payload: {
        sampleIds: parseSampleIds,
        kit,
      },
    });

    await dispatch(loadBackendStatus(experimentId));
  } catch (e) {
    const errorMessage = handleError(e, endUserMessages.ERROR_SAVING);

    dispatch({
      type: SAMPLES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};

export default bulkUpdateSampleKits;
