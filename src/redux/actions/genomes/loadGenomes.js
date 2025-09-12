import fetchAPI from 'utils/http/fetchAPI';
import { GENOMES_LOADED } from 'redux/actionTypes/genomes';
import UploadStatus from 'utils/upload/UploadStatus';

const { UPLOADING, UPLOAD_ERROR } = UploadStatus;
const loadGenomes = () => async (dispatch) => {
  const genomes = await fetchAPI(
    '/v2/genome',
  );

  // store uploadStatus as upload: {status: current:{} }
  //  for consistency with other file upload states
  const customGenomesForRedux = genomes.custom.map((genome) => ({
    ...genome,
    files: Object.values(genome.files).reduce((acc, file) => {
      const { uploadStatus, ...rest } = file;
      acc[file.id] = {
        ...rest,
        upload: { status: { current: uploadStatus === UPLOADING ? UPLOAD_ERROR : uploadStatus } },
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
