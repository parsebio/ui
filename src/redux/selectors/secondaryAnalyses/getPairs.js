import _ from 'lodash';

import { getPairsForFiles } from 'utils/fastqUtils';
import createMemoizedSelector from '../createMemoizedSelector';

const getPairMatchesAreValid = (secondaryAnalysisId) => (state) => {
  if (_.isNil(state[secondaryAnalysisId])) return null;

  const { files } = state[secondaryAnalysisId];

  let pairs;
  try {
    pairs = getPairsForFiles(files.data);
  } catch (e) {
    if (e.message === 'Invalid number of files per sulibrary') {
      // No valid return when pairs are invalid
      return null;
    }

    throw e;
  }

  return pairs;
};

export default createMemoizedSelector(getPairMatchesAreValid);
