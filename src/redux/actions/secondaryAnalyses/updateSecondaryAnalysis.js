import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';

import {
  SECONDARY_ANALYSES_SAVING, SECONDARY_ANALYSES_UPDATED, SECONDARY_ANALYSES_ERROR,
} from 'redux/actionTypes/secondaryAnalyses';
import endUserMessages from 'utils/endUserMessages';
import KitCategory, { immuneDbOptionsByKitCategory } from 'const/enums/KitCategory';

const withSideEffects = (diff, secondaryState) => {
  const sideEffectsDiff = {};

  if (diff.kit) {
    const kitCategory = KitCategory.fromKit(diff.kit);

    if (!immuneDbOptionsByKitCategory[kitCategory].includes(secondaryState.immuneDatabase)) {
      sideEffectsDiff.immuneDatabase = null;
    }
  }

  return { ...diff, ...sideEffectsDiff };
};

const updateSecondaryAnalysis = (
  secondaryAnalysisId,
  diff,
) => async (dispatch, getState) => {
  const secondaryState = getState().secondaryAnalyses[secondaryAnalysisId];

  const fullDiff = withSideEffects(diff, secondaryState);

  dispatch({
    type: SECONDARY_ANALYSES_SAVING,
  });

  try {
    const updatedFiles = await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullDiff),
      },
    );

    dispatch({
      type: SECONDARY_ANALYSES_UPDATED,
      payload: {
        secondaryAnalysisId,
        secondaryAnalysis: fullDiff,
        updatedFiles,
      },
    });
  } catch (e) {
    console.error(e);
    const errorMessage = handleError(e, endUserMessages.ERROR_SAVING);

    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        error: errorMessage,
      },
    });
  }
};

export default updateSecondaryAnalysis;
