/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysesLoaded = produce((draft, action) => {
  const { secondaryAnalysisId, status } = action.payload;

  draft[secondaryAnalysisId].status.current = status;
  draft[secondaryAnalysisId].status.loading = false;
});

export default secondaryAnalysesLoaded;
