import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import {
  SECONDARY_ANALYSIS_LOGS_LOADING,
  SECONDARY_ANALYSIS_LOGS_LOADED,
  SECONDARY_ANALYSES_ERROR,
} from 'redux/actionTypes/secondaryAnalyses';

import pushNotificationMessage from 'utils/pushNotificationMessage';

const loadSecondaryAnalysisLogs = (secondaryAnalysisId, task) => async (dispatch) => {
  const { taskId, sublibrary, process } = task;

  dispatch({
    type: SECONDARY_ANALYSIS_LOGS_LOADING,
    payload: {
      secondaryAnalysisId,
      sublibrary,
      process,
    },
  });

  try {
    const logs = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/task/${taskId}/logs`);
    dispatch({
      type: SECONDARY_ANALYSIS_LOGS_LOADED,
      payload: {
        secondaryAnalysisId,
        sublibrary,
        process,
        data: logs,
      },
    });
  } catch (e) {
    console.error(e);

    const errorMessage = handleError(e, endUserMessages.ERROR_LOADING_LOGS);
    pushNotificationMessage('error', 'We were unable to get the logs for this task.');
    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};

export default loadSecondaryAnalysisLogs;
