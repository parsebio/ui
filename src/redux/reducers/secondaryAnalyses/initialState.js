const secondaryAnalysisTemplate = {
  name: null,
  id: null,
  createdAt: null,
  kit: null,
  chemistryVersion: null,
  numOfSamples: null,
  numOfSublibraries: null,
};

const initialState = {
  meta: {
    loading: false,
    error: false,
    saving: false,
    activeSecondaryAnalysisId: null,
  },
  ids: [],
  // analyses: [],
};

export { secondaryAnalysisTemplate };
export default initialState;
