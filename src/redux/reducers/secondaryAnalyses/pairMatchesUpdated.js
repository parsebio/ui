/* eslint-disable no-param-reassign */
import produce from 'immer';

const pairMatchesUpdated = produce((draft, action) => {
  const { secondaryAnalysisId, matches } = action.payload;

  draft[secondaryAnalysisId].files.pairMatches = matches;
});

export default pairMatchesUpdated;
