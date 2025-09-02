/* eslint-disable no-param-reassign */
import produce from 'immer';

const secondaryAnalysisUpdated = produce((draft, action) => {
  const { secondaryAnalysisId, secondaryAnalysis, updatedFiles = [] } = action.payload;

  draft.meta.saving = false;
  draft[secondaryAnalysisId] = {
    ...draft[secondaryAnalysisId],
    ...secondaryAnalysis,
  };

  updatedFiles.forEach(({ id, type }) => {
    draft[secondaryAnalysisId].files.data[id].type = type;
  });
});

export default secondaryAnalysisUpdated;
