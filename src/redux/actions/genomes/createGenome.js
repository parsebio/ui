import fetchAPI from 'utils/http/fetchAPI';
import { GENOMES_ERROR, GENOMES_CREATED } from 'redux/actionTypes/genomes';
import pushNotificationMessage from 'utils/pushNotificationMessage';

const createGenome = (name, description, secondaryAnalysisId) => async (dispatch) => {
  try {
    const { genomeId } = await fetchAPI(
      '/v2/genome',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, secondaryAnalysisId }),
      },
    );
    dispatch({
      type: GENOMES_CREATED,
      payload: {
        id: genomeId,
        name,
        description,
      },
    });
    return genomeId;
  } catch (e) {
    console.error(e);
    dispatch({
      type: GENOMES_ERROR,
    });
    pushNotificationMessage('error', 'Error creating genome');
    throw e;
  }
};

export default createGenome;
