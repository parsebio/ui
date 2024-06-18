const secondaryAnalysesLoading = (state) => ({
  ...state,
  meta: {
    ...state.meta,
    loading: true,
    error: false,
  },
});

export default secondaryAnalysesLoading;
