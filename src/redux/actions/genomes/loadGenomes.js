import fetchAPI from 'utils/http/fetchAPI';
import { GENOMES_LOADED } from 'redux/actionTypes/genomes';

const loadGenomes = () => async (dispatch) => {
  const genomes = await fetchAPI(
    '/v2/genome',
  );
  dispatch({
    type: GENOMES_LOADED,
    payload: { genomes },
  });
};

export default loadGenomes;
