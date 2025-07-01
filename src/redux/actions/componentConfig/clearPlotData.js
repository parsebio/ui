import { PLOT_DATA_CLEARED } from '../../actionTypes/componentConfig';

const clearPlotData = (plotUuids) => (dispatch) => {
  dispatch({
    type: PLOT_DATA_CLEARED,
    payload: {
      plotUuids,
    },
  });
};

export default clearPlotData;
