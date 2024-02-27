import fetchAPI from 'utils/http/fetchAPI';
import { SECONDARY_ANALYSIS_FILES_DELETE, SECONDARY_ANALYSES_ERROR } from 'redux/actionTypes/secondaryAnalyses';

const deleteSecondaryAnalysisFile = (secondaryAnalysisId, fileId) => async (dispatch) => {
  try {
    await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    dispatch({
      type: SECONDARY_ANALYSIS_FILES_DELETE,
      payload: {
        secondaryAnalysisId,
        fileId,
      },
    });
  } catch (e) {
    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        secondaryAnalysisId,
        error: e,
      },
    });
  }
};

export default deleteSecondaryAnalysisFile;
