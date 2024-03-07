/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisStatusLoading = produce((draft, action) => {
  const { analysisId } = action.payload;

  draft[analysisId].status.loading = true;
});

export default secondaryAnalysisStatusLoading;
