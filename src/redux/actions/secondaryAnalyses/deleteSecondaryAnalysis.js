import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import {
  SECONDARY_ANALYSES_DELETED, SECONDARY_ANALYSES_ERROR,
  SECONDARY_ANALYSES_SAVING, SECONDARY_ANALYSES_SET_ACTIVE,
} from 'redux/actionTypes/secondaryAnalyses';

const deleteSecondaryAnalysis = (
  secondaryAnalysisId, deleteFromReduxOnly = false,
) => async (dispatch, getState) => {
  // Delete samples
  const { secondaryAnalyses } = getState();
  const { activeSecondaryAnalysisId } = secondaryAnalyses.meta;

  try {
    if (!deleteFromReduxOnly) {
      dispatch({
        type: SECONDARY_ANALYSES_SAVING,
        payload: {
          message: endUserMessages.DELETING_PROJECT,
        },
      });

      await fetchAPI(
        `/v2/secondaryAnalysis/${secondaryAnalysisId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
    // If deleted project is the same as the active project, choose another project
    if (secondaryAnalysisId === activeSecondaryAnalysisId) {
      const leftoverProjectIds = secondaryAnalyses.ids
        .filter((uuid) => uuid !== activeSecondaryAnalysisId);

      dispatch({
        type: SECONDARY_ANALYSES_SET_ACTIVE,
        payload: { secondaryAnalysisId: leftoverProjectIds.length ? leftoverProjectIds[0] : null },
      });
    }

    dispatch({
      type: SECONDARY_ANALYSES_DELETED,
      payload: {
        secondaryAnalysisIds: [secondaryAnalysisId],
      },
    });
  } catch (e) {
    const errorMessage = handleError(e, endUserMessages.ERROR_DELETING_PROJECT);

    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        message: errorMessage,
      },
    });
  }
};

export default deleteSecondaryAnalysis;
