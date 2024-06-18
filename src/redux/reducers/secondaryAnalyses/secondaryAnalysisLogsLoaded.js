/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisLogsLoaded = produce((draft, action) => {
  const {
    secondaryAnalysisId, sublibrary, process, data,
  } = action.payload;

  draft[secondaryAnalysisId].status.logs[sublibrary][process].loading = false;
  draft[secondaryAnalysisId].status.logs[sublibrary][process].data = data;
});

export default secondaryAnalysisLogsLoaded;
