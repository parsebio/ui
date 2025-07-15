import _ from 'lodash';

import FastqFileType from 'const/enums/FastqFileType';
import createMemoizedSelector from '../createMemoizedSelector';

import getPairs from './getPairs';

// eslint-disable-next-line no-unused-vars
const getPairMatchesAreValid = (secondaryAnalysisId) => (analysisState, pairs) => {
  if (_.isNil(analysisState) || _.isNil(pairs)) return false;

  const { files, numOfSublibraries } = analysisState;

  const { pairMatches, data: filesData } = files;

  if (filesData === null) return false;

  const wtPairsSize = _.size(pairs[FastqFileType.WT_FASTQ]);
  const immunePairsSize = _.size(pairs[FastqFileType.IMMUNE_FASTQ]);

  return wtPairsSize === immunePairsSize
    && wtPairsSize === _.size(pairMatches)
    && numOfSublibraries === wtPairsSize;
};

export default createMemoizedSelector(
  getPairMatchesAreValid,
  {
    inputSelectors: [
      {
        func: (secondaryAnalysisId) => (state) => state[secondaryAnalysisId],
        paramsIngest: (secondaryAnalysisId) => [secondaryAnalysisId],
      },
      {
        func: getPairs,
        paramsIngest: (secondaryAnalysisId) => [secondaryAnalysisId],
      },

    ],
  },
);
