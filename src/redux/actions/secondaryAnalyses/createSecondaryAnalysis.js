/* eslint-disable no-param-reassign */
import fetchAPI from 'utils/http/fetchAPI';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import {
  SECONDARY_ANALYSES_CREATED,
  SECONDARY_ANALYSES_SAVING,
  SECONDARY_ANALYSES_ERROR,
} from 'redux/actionTypes/secondaryAnalyses';

import endUserMessages from 'utils/endUserMessages';

import handleError from 'utils/http/handleError';

const createSecondaryAnalysis = (name, description) => async (dispatch) => {
  const secondaryAnalysisId = uuidv4();
  const createdAt = dayjs().toISOString();

  const newSecondaryAnalysisProperties = {
    id: secondaryAnalysisId,
    name,
    description,
  };

  dispatch({
    type: SECONDARY_ANALYSES_SAVING,
  });

  try {
    await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSecondaryAnalysisProperties),
      },
    );

    dispatch({
      type: SECONDARY_ANALYSES_CREATED,
      payload: {
        secondaryAnalysis: { ...newSecondaryAnalysisProperties, createdAt },
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

  return Promise.resolve(secondaryAnalysisId);
};

export default createSecondaryAnalysis;
