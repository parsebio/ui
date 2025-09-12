import { GENOMES_UPDATED, GENOMES_ERROR } from 'redux/actionTypes/genomes';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import fetchAPI from 'utils/http/fetchAPI';

const updateGenome = (genomeId, diff) => async (dispatch) => {
  try {
    await fetchAPI(
      `/v2/genome/${genomeId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diff),
      },
    );

    dispatch({
      type: GENOMES_UPDATED,
      payload: {
        genomeId,
        diff,
      },
    });
  } catch (e) {
    pushNotificationMessage('error', 'Error updating genome');
    dispatch({
      type: GENOMES_ERROR,
    });
  }
};

export default updateGenome;
