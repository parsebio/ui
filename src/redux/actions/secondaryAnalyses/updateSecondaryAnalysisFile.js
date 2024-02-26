import UploadStatus from 'utils/upload/UploadStatus';
import fetchAPI from 'utils/http/fetchAPI';
import { SECONDARY_ANALYSIS_FILES_UPDATE } from 'redux/actionTypes/secondaryAnalyses';

const updateSecondaryAnalysisFile = (secondaryAnalysisId, fileId, uploadStatus, percentProgress) => async (dispatch) => {
  if (uploadStatus !== UploadStatus.UPLOADING) {
    const url = `/v2/secondaryAnalysis/${secondaryAnalysisId}/files`;
    const body = { uploadStatus, id: fileId };
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
        type: SECONDARY_ANALYSIS_FILES_UPDATE,
        payload: {
          secondaryAnalysisId,
          fileId,
          uploadStatus: UploadStatus.UPLOAD_ERROR,
        },
      });
      return;
    }
  }
  dispatch({
    type: SECONDARY_ANALYSIS_FILES_UPDATE,
    payload: {
      secondaryAnalysisId,
      uploadStatus,
      fileId,
      percentProgress,
    },
  });
};

export default updateSecondaryAnalysisFile;
