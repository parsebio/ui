import fetchAPI from 'utils/http/fetchAPI';
import { GENOMES_LOADED } from 'redux/actionTypes/genomes';

const loadGenomes = () => async (dispatch) => {
  const genomes = await fetchAPI(
    '/v2/genome',
  );
  // store uploadStatus as upload: {status: current:{} }
  //  for consistency with other file upload states
  const customGenomesForRedux = genomes.custom.map((genome) => ({
    ...genome,
    files: genome.files.reduce((acc, file) => {
      const { id, uploadStatus, ...rest } = file;
      acc[id] = {
        ...rest,
        upload: { status: { current: uploadStatus } },
      };
      return acc;
    }, {}),
  }));

  dispatch({
    type: GENOMES_LOADED,
    payload: { genomes: { ...genomes, custom: customGenomesForRedux } },
  });
};

export default loadGenomes;
