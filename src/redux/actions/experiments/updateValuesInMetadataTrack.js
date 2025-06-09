import _ from 'lodash';
import {
  SAMPLES_ERROR,
  SAMPLES_SAVING,
  SAMPLES_VALUE_IN_METADATA_TRACK_UPDATED,
} from 'redux/actionTypes/samples';

import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';

import endUserMessages from 'utils/endUserMessages';
import { loadBackendStatus } from 'redux/actions/backendStatus';

const updateValuesInMetadataTrack = (
  experimentId,
  metadataTrackKey,
  updates,
) => async (dispatch) => {
  if (
    _.sumBy(updates, ({ sampleIds }) => sampleIds.length) === 0
  ) return;

  dispatch({ type: SAMPLES_SAVING, payload: { message: endUserMessages.SAVING_SAMPLE } });

  try {
    await fetchAPI(
      `/v2/experiments/${experimentId}/metadataTracks/${metadataTrackKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      },
    );

    dispatch({
      type: SAMPLES_VALUE_IN_METADATA_TRACK_UPDATED,
      payload: {
        key: metadataTrackKey,
        updates,
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
