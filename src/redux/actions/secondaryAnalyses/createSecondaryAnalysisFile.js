import fetchAPI from 'utils/http/fetchAPI';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import { SECONDARY_ANALYSES_ERROR, SECONDARY_ANALYSIS_FILES_LOADED } from 'redux/actionTypes/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';
import dayjs from 'dayjs';

const createSecondaryAnalysisFile = (secondaryAnalysisId, file, type) => async (dispatch) => {
  const { name, size } = file;
  try {
    const uploadUrlParams = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, size, type }),
    });

    const fileRecordRedux = {
      id: uploadUrlParams.fileId,
      name: file.name,
      size: file.size,
      type,
      createdAt: dayjs().toISOString(),
      upload: {
        status: UploadStatus.QUEUED,
        progress: 0,
      },
    };
    console.log('FILE UPLOAD REDUX ', fileRecordRedux);
    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADED,
      payload: {
        secondaryAnalysisId,
        files: [fileRecordRedux],
      },
    });

    return uploadUrlParams;
  } catch (e) {
    pushNotificationMessage('error', 'Something went wrong while uploading your file.');
    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        secondaryAnalysisId,
        error: e,
      },
    });
    console.log(e);
  }
};
export default createSecondaryAnalysisFile;
