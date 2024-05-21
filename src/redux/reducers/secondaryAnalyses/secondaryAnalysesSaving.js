const secondaryAnalysesSaving = (state) => ({
  ...state,
  meta: {
    ...state.meta,
    saving: true,
    error: false,
  },
});

export default secondaryAnalysesSaving;
