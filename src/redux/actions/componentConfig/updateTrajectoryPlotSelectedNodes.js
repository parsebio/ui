import { analysisTools } from 'const';
import { TRAJECTORY_NODES_SELECTION_UPDATED } from '../../actionTypes/componentConfig';

const updateTrajectoryPlotSelectedNodes = (plotUuid, nodes, action) => (dispatch, getState) => {
  const { analysisTool } = getState().experimentSettings.processing.dataIntegration;

  const updatedAction = action === 'add' && analysisTool === analysisTools.SCANPY ? 'replace' : action;

  dispatch({
    type: TRAJECTORY_NODES_SELECTION_UPDATED,
    payload:
      { plotUuid, nodes, action: updatedAction },
  });
};

export default updateTrajectoryPlotSelectedNodes;
