/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisLogsLoading = produce((draft, action) => {
  const { secondaryAnalysisId, sublibrary, process } = action.payload;

  if (!draft[secondaryAnalysisId].status.logs) {
    draft[secondaryAnalysisId].status.logs = {};
  }
  if (!draft[secondaryAnalysisId].status.logs[sublibrary]) {
    draft[secondaryAnalysisId].status.logs[sublibrary] = {};
  }
  draft[secondaryAnalysisId].status.logs[sublibrary][process] = {};
  draft[secondaryAnalysisId].status.logs[sublibrary][process] = {};
  draft[secondaryAnalysisId].status.logs[sublibrary][process].loading = true;
});

export default secondaryAnalysisLogsLoading;
