import fetchAPI from 'utils/http/fetchAPI';
import { SECONDARY_ANALYSIS_FILES_DELETE, SECONDARY_ANALYSES_ERROR } from 'redux/actionTypes/secondaryAnalyses';
import handleError from 'utils/http/handleError';

const deleteSecondaryAnalysisFile = (secondaryAnalysisId, fileId) => async (dispatch, getState) => {
  const { data: filesData } = getState().secondaryAnalyses[secondaryAnalysisId].files;

  // Abort upload if it is ongoing
  // eslint-disable-next-line no-unused-expressions
  filesData[fileId].upload
    .abortController?.abort('File deleted');

  try {
    await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    // On delete, receive updated pair matches
    // and update the redux store
    dispatch({
      type: SECONDARY_ANALYSIS_FILES_DELETE,
      payload: {
        secondaryAnalysisId,
        fileId,
      },
    });
  } catch (e) {
    console.error(e);
    handleError(e, 'Something went wrong while deleting your file.');
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
