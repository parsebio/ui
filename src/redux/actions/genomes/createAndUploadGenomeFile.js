import fetchAPI from 'utils/http/fetchAPI';
import { GENOME_FILE_CREATED } from 'redux/actionTypes/genomes';
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

    const abortController = new AbortController();
    dispatch({
      type: GENOME_FILE_CREATED,
      payload: {
        genomeId,
        fileId: genomeFileId,
        diff: {
          id: genomeFileId,
          createdAt: new Date().toISOString(),
          upload: {
            status: { current: UploadStatus.UPLOADING },
            percentProgress: 0,
            abortController,
          },
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
