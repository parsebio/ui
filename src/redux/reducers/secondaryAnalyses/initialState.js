const secondaryAnalysisTemplate = {
  name: null,
  id: null,
  createdAt: null,
  kit: null,
  chemistryVersion: null,
  numOfSamples: null,
  numOfSublibraries: null,
  files: { data: {} },
};

const initialState = {
  meta: {
    loading: false,
    error: false,
    saving: false,
    activeSecondaryAnalysisId: null,
  },
  ids: [],
};

export { secondaryAnalysisTemplate };
export default initialState;
