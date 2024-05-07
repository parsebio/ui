/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisLogsLoading = produce((draft, action) => {
  const { secondaryAnalysisId, sublibrary, process } = action.payload;

  if (!draft[secondaryAnalysisId].status.logs) {
    draft[secondaryAnalysisId].status.logs = {};
  }

  const logsDraft = draft[secondaryAnalysisId].status.logs;

  if (!logsDraft[sublibrary]) {
    logsDraft[sublibrary] = {};
  }
  logsDraft[sublibrary][process] = {};
  logsDraft[sublibrary][process].loading = true;
});

export default secondaryAnalysisLogsLoading;
