import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { useDispatch, useSelector } from 'react-redux';
import { getIsScanpy } from 'redux/selectors';
import { Tooltip } from 'antd';
import { loadProcessingSettings } from 'redux/actions/experimentSettings';

const ScanpyDisabler = ({ children }) => {
  const dispatch = useDispatch();

  const isScanpy = useSelector(getIsScanpy());
  const experimentId = useSelector((state) => (
    state.experimentSettings.info.experimentId
  ), _.isEqual);

  useEffect(() => {
    if (_.isNil(isScanpy)) {
      dispatch(loadProcessingSettings(experimentId));
    }
  }, [isScanpy, experimentId]);

  if (!isScanpy) { return children; }

  // First div is to trigger hover events
  // Second div is to disable everything under the tooltip without having to clone the children
  return (
    <Tooltip title='Coming soon!'>
      <div>
        <div disabled style={{ pointerEvents: 'none', opacity: 0.5 }}>
          {children}
        </div>
      </div>
    </Tooltip>
  );
};

ScanpyDisabler.defaultProps = {};

ScanpyDisabler.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ScanpyDisabler;
