import { RESET_CONFIG, SAVE_CONFIG } from 'redux/actionTypes/componentConfig';
import { initialPlotConfigStates } from 'redux/reducers/componentConfig/initialState';
import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';
import { getHasPermissions } from 'redux/selectors';
import { permissions } from 'utils/constants';

const resetPlotConfig = (experimentId, plotUuid, plotType) => async (dispatch, getState) => {
  const defaultConfig = initialPlotConfigStates[plotType];

  try {
    // Skip saving if the user does not have write permissions.
    if (getHasPermissions(null, permissions.WRITE)(getState())) {
      await fetchAPI(
        `/v2/experiments/${experimentId}/plots/${plotUuid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config: defaultConfig }),
        },
      );
    }

    dispatch({
      type: RESET_CONFIG,
      payload: {
        plotUuid,
        config: defaultConfig,
      },
    });

    return defaultConfig;
  } catch (e) {
    handleError(e, endUserMessages.ERROR_SAVING_PLOT_CONFIG);

    dispatch({
      type: SAVE_CONFIG,
      payload:
        { plotUuid, success: false },
    });
  }
};

export default resetPlotConfig;
