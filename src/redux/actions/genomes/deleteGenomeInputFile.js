import { GENOME_FILE_DELETED, GENOMES_ERROR } from 'redux/actionTypes/genomes';
import pushNotificationMessage from 'utils/pushNotificationMessage';

import fetchAPI from 'utils/http/fetchAPI';

const deleteGenomeInputFile = (genomeId, fileId) => async (dispatch, getState) => {
  try {
    const genome = getState().genomes.custom[genomeId];
    const { pairFileId } = genome.files[fileId];
    const fileIdsToDelete = Object.values(genome.files)
      .filter((file) => file.pairFileId === pairFileId).map((file) => file.id);

    await fetchAPI(
      `/v2/genomeFile/${genomeId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds: fileIdsToDelete }),
      },
    );
    dispatch({
      type: GENOME_FILE_DELETED,
      payload: { genomeId, fileIds: fileIdsToDelete },
    });
  } catch (error) {
    console.error('Error deleting genome input file:', error);
    pushNotificationMessage('error', 'Error deleting genome input file');
    dispatch({
      type: GENOMES_ERROR,
    });
  }
};

export default deleteGenomeInputFile;
