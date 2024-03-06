const secondaryAnalysisCreated = (state, action) => {
  const {
    secondaryAnalysis,
  } = action.payload;

  const newSecondaryAnalysis = {
    files: { data: {}, loading: false, error: false },
    status: { current: null, loading: false, error: false },
    ...secondaryAnalysis,
  };

  return {
    ...state,
    ids: [...state.ids, newSecondaryAnalysis.id],
    [newSecondaryAnalysis.id]: newSecondaryAnalysis,
    meta: {
      ...state.meta,
      activeSecondaryAnalysisId: newSecondaryAnalysis.id,
      saving: false,
    },
  };
};

export default secondaryAnalysisCreated;
