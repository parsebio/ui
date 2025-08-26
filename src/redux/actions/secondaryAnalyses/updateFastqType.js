import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import {
  SECONDARY_ANALYSIS_FILES_ERROR, SECONDARY_ANALYSIS_FILES_FASTQ_TYPE_UPDATED,
} from 'redux/actionTypes/secondaryAnalyses';

const updateFastqType = (secondaryAnalysisId, fastqType, fileIds) => async (dispatch) => {
  // TODO check, this might not be needed
  // dispatch({
  //   type: SECONDARY_ANALYSES_SAVING,
  // });

  try {
    await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}/files/fastqsType`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds,
          fastqType,
        }),
      },
    );

    dispatch({
      type: SECONDARY_ANALYSIS_FILES_FASTQ_TYPE_UPDATED,
      payload: {
        secondaryAnalysisId,
        fileIds,
        fastqType,
      },
    });
  } catch (e) {
    console.error(e);
    const errorMessage = handleError(e, endUserMessages.ERROR_UPDATING_FASTQ_TYPE);

    dispatch({
      type: SECONDARY_ANALYSIS_FILES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};

export default updateFastqType;
