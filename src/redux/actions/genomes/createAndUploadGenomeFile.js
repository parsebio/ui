import fetchAPI from 'utils/http/fetchAPI';
import { GENOME_FILE_UPDATE } from 'redux/actionTypes/genomes';
import { updateGenomeFileUploadProgress } from 'redux/actions/genomes';
import { getShouldCompress } from 'utils/upload/fileInspector';
import UploadsCoordinator from 'utils/upload/UploadsCoordinator';
import UploadStatus from 'utils/upload/UploadStatus';

const createAndUploadGenomeFile = (
  genomeId,
  file,
  type,
  pairFileId,
) => async (dispatch) => {
  console.log('CREATING GENOME FILE', genomeId, file, type, pairFileId);
  const { name, size } = file;
  const body = {
    name,
    size,
    type,
    pairFileId,
  };
  let genomeFileId;
  try {
    const uploadUrlParams = await fetchAPI(
      `/v2/genomeFile/${genomeId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    genomeFileId = uploadUrlParams.fileId;
    console.log('RECEIVED UPLOAD PARAMS', uploadUrlParams, genomeFileId);
    const abortController = new AbortController();
    dispatch({
      type: GENOME_FILE_UPDATE,
      payload: {
        genomeId,
        fileId: genomeFileId,
        diff: {
          upload: { uploadStatus: UploadStatus.UPLOADING, progress: 0, abortController },
          name,
          size,
          type,
        },
      },
    });

    const updateProgress = (status, percentProgress = 0) => {
      dispatch(updateGenomeFileUploadProgress(
        status,
        percentProgress,
        genomeFileId,
        genomeId,
      ));
    };
    const options = {
      compress: await getShouldCompress(file),
    };

    console.log('will compress ', options.compress);

    await UploadsCoordinator.get().uploadFile([
      genomeId,
      file,
      uploadUrlParams,
      'genome',
      abortController,
      updateProgress,
      options,
    ]);
  } catch (e) {
    dispatch(updateGenomeFileUploadProgress(
      UploadStatus.UPLOAD_ERROR,
      0,
      genomeFileId,
      genomeId,
    ));
  }
};

export default createAndUploadGenomeFile;
