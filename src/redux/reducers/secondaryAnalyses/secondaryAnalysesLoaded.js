/* eslint-disable no-param-reassign */
import produce, { original } from 'immer';
import _ from 'lodash';

const secondaryAnalysesLoaded = produce((draft, action) => {
  const { secondaryAnalyses } = action.payload;

  const originalState = original(draft);

  let newActiveSecondaryAnalysisId = originalState.meta.activeSecondaryAnalysisId;
  // If the current active analysis no longer exists, change it
  if (!Object.keys(originalState).includes(newActiveSecondaryAnalysisId)) {
    newActiveSecondaryAnalysisId = secondaryAnalyses[0]?.id;
  }

  const ids = _.map(secondaryAnalyses, 'id');

  draft.meta.activeSecondaryAnalysisId = newActiveSecondaryAnalysisId;
  draft.meta.loading = false;
  draft.ids = ids;

  secondaryAnalyses.forEach((analysis) => {
    draft[analysis.id] = {
      files: { data: {}, loading: false, error: false },
      status: { current: null, loading: false, error: false },
      ...analysis,
    };
  });
});

export default secondaryAnalysesLoaded;
