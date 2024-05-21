/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisFilesLoadingReducer = produce((draft, action) => {
  const { secondaryAnalysisId } = action.payload;
  draft[secondaryAnalysisId].files.loading = true;
}, {});

export default secondaryAnalysisFilesLoadingReducer;
