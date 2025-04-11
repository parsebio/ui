import { SAVE_CONFIG } from 'redux/actionTypes/componentConfig';
import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';
import { permissions } from 'utils/constants';
import { getHasPermissions } from 'redux/selectors';

const savePlotConfig = (experimentId, plotUuid) => async (dispatch, getState) => {
  const hasPermissions = getHasPermissions(null, permissions.WRITE)(getState());

  if (!hasPermissions) {
    return;
  }

  // Do not save the 'outstandingChanges' state to the database.
  // Do not save the 'plotData' state to the database because it is not managed by the UI.
  // Do not save loading and error as it they are states in the UI.
  const {
    keepValuesOnReset,
    outstandingChanges,
    plotData,
    loading,
    error,
    ...content
  } = getState().componentConfig[plotUuid];

  try {
    await fetchAPI(
      `/v2/experiments/${experimentId}/plots/${plotUuid}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      },
    );

    dispatch({
      type: SAVE_CONFIG,
      payload: { plotUuid, success: true },
    });
  } catch (e) {
    handleError(e, endUserMessages.ERROR_SAVING_PLOT_CONFIG);

    dispatch({
      type: SAVE_CONFIG,
      payload:
        { plotUuid, success: false },
    });
  }
};

export default savePlotConfig;
