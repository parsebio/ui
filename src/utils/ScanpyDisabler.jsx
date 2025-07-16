import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { useDispatch, useSelector } from 'react-redux';
import { getIsScanpy } from 'redux/selectors';
import { loadProcessingSettings } from 'redux/actions/experimentSettings';
import Disabler from 'utils/Disabler';

const scanpyDisableMessage = 'This feature is only available for Seurat projects.';

const ScanpyDisabler = ({ experimentId: customExperimentId, children }) => {
  const dispatch = useDispatch();

  const isScanpy = useSelector(getIsScanpy());
  const openExperimentId = useSelector((state) => (
    state.experimentSettings.info.experimentId
  ), _.isEqual);

  const experimentId = customExperimentId ?? openExperimentId;

  useEffect(() => {
    if (_.isNil(isScanpy)) {
      dispatch(loadProcessingSettings(experimentId));
    }
  }, [isScanpy, experimentId]);

  return (
    <Disabler disable={isScanpy} tooltipText={scanpyDisableMessage}>
      {children}
    </Disabler>
  );
};

ScanpyDisabler.defaultProps = {
  experimentId: undefined,
};

ScanpyDisabler.propTypes = {
  children: PropTypes.node.isRequired,
  experimentId: PropTypes.string,
};

export default ScanpyDisabler;

export { scanpyDisableMessage };
