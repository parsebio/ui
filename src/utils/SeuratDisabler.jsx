import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { useDispatch, useSelector } from 'react-redux';
import { getIsSeurat } from 'redux/selectors';
import { loadProcessingSettings } from 'redux/actions/experimentSettings';
import Disabler from './Disabler';

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

  return (
    <Disabler disable={isSeurat} tooltipText={seuratDisableMessage}>
      {children}
    </Disabler>
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
