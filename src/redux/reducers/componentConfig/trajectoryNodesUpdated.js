/* eslint-disable no-param-reassign */
import produce, { original } from 'immer';
import _ from 'lodash';

const trajectoryNodesSelectionUpdated = produce((draft, action) => {
  const { plotUuid, nodes, action: updateAction } = action.payload;

  let newNodes;
  const plotConfig = draft[plotUuid].config;

  if (updateAction === 'add') {
    newNodes = [...new Set([...nodes, ...original(draft[plotUuid]).config.selectedNodes])];
    plotConfig.selectedNodes = newNodes;
  } else if (updateAction === 'replace') {
    plotConfig.selectedNodes = nodes;
  } else if (updateAction === 'remove') {
    plotConfig.selectedNodes = _.difference(original(plotConfig.selectedNodes), nodes);
  }

  draft[plotUuid].outstandingChanges = true;
});

export default trajectoryNodesSelectionUpdated;
