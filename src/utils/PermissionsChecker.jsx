import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { getIsAuthorized } from 'redux/selectors';
import { Tooltip } from 'antd';

const scanpyDisableMessage = 'Your current role in this project does not allow you to perform this action.';

const PermissionsChecker = ({ experimentId, category, children }) => {
  const isAuthorized = useSelector(getIsAuthorized(experimentId, category));

  if (isAuthorized) {
    return children;
  }

  // First div is to trigger hover events
  // Second div is to disable everything under the tooltip without having to clone the children
  return (
    <Tooltip title={scanpyDisableMessage}>
      <div>
        <div disabled style={{ pointerEvents: 'none', opacity: 0.5 }}>
          {children}
        </div>
      </div>
    </Tooltip>
  );
};

PermissionsChecker.defaultProps = {
  experimentId: undefined,
};

PermissionsChecker.propTypes = {
  children: PropTypes.node.isRequired,
  category: PropTypes.string.isRequired,
  experimentId: PropTypes.string,
};

export default PermissionsChecker;

export { scanpyDisableMessage };
