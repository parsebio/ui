import { SECONDARY_ANALYSES_ERROR, SECONDARY_PAIR_MATCHES_UPDATED } from 'redux/actionTypes/secondaryAnalyses';
import endUserMessages from 'utils/endUserMessages';
import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';

// The ui gets the pair's names from the files (using getSublibraryName from fastqUtils),
// The api needs the pairs the fileids instead of the pair names,
// so we need to translate before sending the update.
const translateMatchesPairsToFiles = (matches, pairs) => {
  console.log('matchespairsDebug');
  console.log({ matches, pairs });
};

const updatePairMatch = (secondaryAnalysisId, matches, pairs) => async (dispatch) => {
  dispatch({
    type: SECONDARY_PAIR_MATCHES_UPDATED,
    payload: {
      secondaryAnalysisId,
      matches,
    },
  });

  translateMatchesPairsToFiles(matches, pairs);

  try {
    await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}/files/pairMatches`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matches),
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
