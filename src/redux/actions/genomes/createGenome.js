import fetchAPI from 'utils/http/fetchAPI';
import { GENOMES_LOADED, GENOMES_ERROR } from 'redux/actionTypes/genomes';
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
      type: GENOMES_LOADED,
      payload: {
        genomes: {
          custom: [{
            id: genomeId,
            name,
            description,
            files: {},
            createdAt: new Date().toISOString(),
          }],
        },
      },
    });
    return genomeId;
  } catch (e) {
    dispatch({
      type: GENOMES_ERROR,
      payload: { error: e },
    });
    pushNotificationMessage('error', 'Error creating genome');
    throw e;
  }
};

export default createGenome;
