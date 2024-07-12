import { SECONDARY_ANALYSES_LOADED } from 'redux/actionTypes/secondaryAnalyses';

const storeLoadedAnalysis = (secondaryAnalysis) => async (dispatch) => {
  dispatch({
    type: SECONDARY_ANALYSES_LOADED,
    payload: { secondaryAnalyses: [secondaryAnalysis] },
  });
};
export default storeLoadedAnalysis;
