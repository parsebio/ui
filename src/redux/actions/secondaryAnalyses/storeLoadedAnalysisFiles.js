import { SECONDARY_ANALYSIS_FILES_LOADED } from 'redux/actionTypes/secondaryAnalyses';

const storeLoadedAnalysisFiles = (secondaryAnalysisId, files) => async (dispatch) => {
  dispatch({
    type: SECONDARY_ANALYSIS_FILES_LOADED,
    payload: {
      secondaryAnalysisId,
      files,
    },
  });
};

export default storeLoadedAnalysisFiles;
