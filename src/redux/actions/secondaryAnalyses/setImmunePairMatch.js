import { SECONDARY_PAIR_MATCHES_UPDATED } from 'redux/actionTypes/secondaryAnalyses';

const updatePairMatch = (secondaryAnalysisId, matches) => ({
  type: SECONDARY_PAIR_MATCHES_UPDATED,
  payload: {
    secondaryAnalysisId,
    matches,
  },
});

export default updatePairMatch;
