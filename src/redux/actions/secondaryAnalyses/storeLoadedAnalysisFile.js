import { SECONDARY_ANALYSIS_FILES_LOADED } from 'redux/actionTypes/secondaryAnalyses';

const storeLoadedAnalysisFile = (secondaryAnalysisId, file) => async (dispatch) => {
  dispatch({
    type: SECONDARY_ANALYSIS_FILES_LOADED,
    payload: {
      secondaryAnalysisId,
      files: [file],
    },
  });
};

export default storeLoadedAnalysisFile;
