import FastqFileType from 'const/enums/FastqFileType';
import { SECONDARY_ANALYSES_ERROR, SECONDARY_PAIR_MATCHES_UPDATED } from 'redux/actionTypes/secondaryAnalyses';
import endUserMessages from 'utils/endUserMessages';
import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';

// The ui gets the pair's names from the files (using getPairData from fastqUtils),
// The api needs the pairs the fileids instead of the pair names,
// so we need to translate before sending the update.
const translatePairsToFiles = (matches, pairs) => {
  const matchedFiles = [];

  Object.entries(matches).forEach(([immunePairName, wtPairName]) => {
    const wtPair = pairs[FastqFileType.WT_FASTQ][wtPairName];
    const immunePair = pairs[FastqFileType.IMMUNE_FASTQ][immunePairName];

    matchedFiles.push({
      wtR1FileId: wtPair[0],
      wtR2FileId: wtPair[1],
      immuneFileR1Id: immunePair[0],
      immuneFileR2Id: immunePair[1],
    });
  });

  return matchedFiles;
};

const updatePairMatch = (secondaryAnalysisId, matchedPairs, pairsData) => async (dispatch) => {
  dispatch({
    type: SECONDARY_PAIR_MATCHES_UPDATED,
    payload: {
      secondaryAnalysisId,
      matches: matchedPairs,
    },
  });

  const matchedFiles = translatePairsToFiles(matchedPairs, pairsData);

  try {
    await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}/files/pairMatches`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchedFiles),
      },
    );
  } catch (e) {
    console.error(e);

    // TODO get the pair matches that remained from the api's response and set them in the store
    const errorMessage = handleError(e, endUserMessages.ERROR_UPDATING_FASTQ_PAIRS);

    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};

export default updatePairMatch;
