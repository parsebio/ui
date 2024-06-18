const secondaryAnalysisUpdated = (state, action) => {
  const { secondaryAnalysisId, secondaryAnalysis } = action.payload;

  return {
    ...state,
    meta: {
      ...state.meta,
      saving: false,
    },
    [secondaryAnalysisId]: {
      ...state[secondaryAnalysisId],
      ...secondaryAnalysis,
    },
  };
};

export default secondaryAnalysisUpdated;
