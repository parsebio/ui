import {
  SAMPLES_ERROR,
  SAMPLES_SAVING,
  SAMPLES_VALUE_IN_METADATA_TRACK_UPDATED,
} from 'redux/actionTypes/samples';

import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';

import endUserMessages from 'utils/endUserMessages';
import { loadBackendStatus } from '../backendStatus';

const updateValuesInMetadataTrack = (
  experimentId,
  sampleIds,
  metadataTrackKey,
  value,
) => async (dispatch) => {
  if (sampleIds.length === 0) return;
  dispatch({ type: SAMPLES_SAVING, payload: { message: endUserMessages.SAVING_SAMPLE } });

  try {
    const body = { value, sampleIds };

    await fetchAPI(
      `/v2/experiments/${experimentId}/metadataTracks/${metadataTrackKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    dispatch({
      type: SAMPLES_VALUE_IN_METADATA_TRACK_UPDATED,
      payload: {
        sampleUuids: sampleIds,
        key: metadataTrackKey,
        value,
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

export default updateValuesInMetadataTrack;
