import {
  SECONDARY_ANALYSES_DELETED, SECONDARY_ANALYSES_SET_ACTIVE,
} from 'redux/actionTypes/secondaryAnalyses';

const removeSecondaryAnalysis = (secondaryAnalysisId) => (dispatch, getState) => {
  // If deleted project is the same as the active project, choose another project
  const { secondaryAnalyses } = getState();
  const { activeSecondaryAnalysisId } = secondaryAnalyses.meta;
  if (secondaryAnalysisId === activeSecondaryAnalysisId) {
    const leftoverProjectIds = secondaryAnalyses.ids
      .filter((uuid) => uuid !== activeSecondaryAnalysisId);

    dispatch({
      type: SECONDARY_ANALYSES_SET_ACTIVE,
      payload: { secondaryAnalysisId: leftoverProjectIds.length ? leftoverProjectIds[0] : null },
    });
  }

  dispatch({
    type: SECONDARY_ANALYSES_DELETED,
    payload: {
      secondaryAnalysisIds: [secondaryAnalysisId],
    },
  });
};
export default removeSecondaryAnalysis;
