import _ from 'lodash';

import { getPairs } from 'utils/fastqUtils';
import FastqFileType from 'const/enums/FastqFileType';
import createMemoizedSelector from '../createMemoizedSelector';

const getPairMatchesAreValid = (secondaryAnalysisId) => (state) => {
  if (_.isNil(state[secondaryAnalysisId])) return false;

  const {
    files, numOfSublibraries,
  } = state[secondaryAnalysisId];

  const { pairMatches, data: filesData } = files;

  let pairs;
  try {
    pairs = getPairs(filesData);
  } catch (e) {
    if (e.message === 'Invalid number of files per sulibrary') {
      return false;
    }

    throw e;
  }

  const wtPairsSize = _.size(pairs[FastqFileType.WT_FASTQ]);
  const immunePairsSize = _.size(pairs[FastqFileType.IMMUNE_FASTQ]);

  return wtPairsSize === immunePairsSize
    && wtPairsSize === _.size(pairMatches)
    && numOfSublibraries === wtPairsSize;
};

export default createMemoizedSelector(getPairMatchesAreValid);
