import {
  SECONDARY_ANALYSES_SET_ACTIVE,
} from 'redux/actionTypes/secondaryAnalyses';

const setActiveSecondaryAnalysis = (
  secondaryAnalysisId,
) => async (dispatch, getState) => {
  const {
    activeSecondaryAnalysisId,
  } = getState().secondaryAnalyses.meta;

  if (activeSecondaryAnalysisId === secondaryAnalysisId) return null;

  dispatch({
    type: SECONDARY_ANALYSES_SET_ACTIVE,
    payload: { secondaryAnalysisId },
  });
};

export default setActiveSecondaryAnalysis;
