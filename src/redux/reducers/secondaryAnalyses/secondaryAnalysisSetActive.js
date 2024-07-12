const secondaryAnalysisSetActive = (state, action) => {
  const { secondaryAnalysisId } = action.payload;
  return {
    ...state,
    meta: {
      ...state.meta,
      activeSecondaryAnalysisId: secondaryAnalysisId,
    },
  };
};

export default secondaryAnalysisSetActive;
