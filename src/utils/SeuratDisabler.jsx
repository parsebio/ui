import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { useDispatch, useSelector } from 'react-redux';
import { getIsSeurat } from 'redux/selectors';
import { Tooltip } from 'antd';
import { loadProcessingSettings } from 'redux/actions/experimentSettings';

const seuratDisableMessage = 'This feature is not available in Seurat mode.';

const SeuratDisabler = ({ experimentId: customExperimentId, children }) => {
  const dispatch = useDispatch();

  const isSeurat = useSelector(getIsSeurat());
  const openExperimentId = useSelector((state) => (
    state.experimentSettings.info.experimentId
  ), _.isEqual);

  const experimentId = customExperimentId ?? openExperimentId;

  useEffect(() => {
    if (_.isNil(isSeurat)) {
      dispatch(loadProcessingSettings(experimentId));
    }
  }, [isSeurat, experimentId]);

  if (!isSeurat) { return children; }

  // First div is to trigger hover events
  // Second div is to disable everything under the tooltip without having to clone the children
  return (
    <Tooltip title={seuratDisableMessage}>
      <div>
        <div disabled style={{ pointerEvents: 'none', opacity: 0.5 }}>
          {children}
        </div>
      </div>
    </Tooltip>
  );
};

SeuratDisabler.defaultProps = {
  experimentId: undefined,
};

SeuratDisabler.propTypes = {
  children: PropTypes.node.isRequired,
  experimentId: PropTypes.string,
};

export default SeuratDisabler;
export { seuratDisableMessage };
