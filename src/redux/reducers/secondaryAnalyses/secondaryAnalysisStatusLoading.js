/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisStatusLoading = produce((draft, action) => {
  const { secondaryAnalysisId } = action.payload;

  draft[secondaryAnalysisId].status.loading = true;
});

export default secondaryAnalysisStatusLoading;
