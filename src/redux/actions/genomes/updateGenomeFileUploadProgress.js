import { GENOME_FILE_UPDATE } from 'redux/actionTypes/genomes';
import UploadStatus from 'utils/upload/UploadStatus';
import endUserMessages from 'utils/endUserMessages';

import handleError from 'utils/http/handleError';
import fetchAPI from 'utils/http/fetchAPI';

const updateGenomeFileUploadProgress = (
  uploadStatus,
  progress,
  fileId,
  genomeId,
) => async (dispatch) => {
  if (uploadStatus !== UploadStatus.UPLOADING) {
    const url = `/v2/genomeFile/${genomeId}/${fileId}`;
    const body = { uploadStatus };

    try {
      await fetchAPI(
        url,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );
    } catch (e) {
      dispatch({
        type: GENOME_FILE_UPDATE,
        payload: {
          genomeId,
          fileId,
          diff: {
            upload: { uploadStatus: UploadStatus.UPLOAD_ERROR },
          },
        },
      });
      handleError(e, endUserMessages.ERROR_UPDATE_SERVER_ON_UPLOAD_STATE);
      return;
    }
  }

  dispatch({
    type: GENOME_FILE_UPDATE,
    payload: {
      genomeId,
      fileId,
      diff: {
        upload: {
          uploadStatus,
          progress,
        },
      },
    },
  });

  return {
    type: GENOME_FILE_UPDATE,
    payload: progress,
  };
};

export default updateGenomeFileUploadProgress;
