/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysesLoaded = produce((draft, action) => {
  const { analysisId, status } = action.payload;

  draft[analysisId].status.current = status;
  draft[analysisId].status.loading = false;
});

export default secondaryAnalysesLoaded;
