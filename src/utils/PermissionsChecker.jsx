import React from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import { getHasPermissions } from 'redux/selectors';
import { Tooltip } from 'antd';

const notAllowedMessage = 'Your current role in this project does not allow you to perform this action.';

const PermissionsChecker = ({
  experimentId, permissions, grayedOut, children, projectType,
}) => {
  const isAuthorized = useSelector(getHasPermissions(experimentId, permissions, projectType));

  if (isAuthorized) {
    return children;
  }

  // First div is to trigger hover events
  // Second div is to disable everything under the tooltip without having to clone the children
  return (
    <Tooltip title={notAllowedMessage} mouseEnterDelay={1}>
      <div>
        <div disabled style={{ pointerEvents: 'none', opacity: grayedOut ? 0.5 : 1 }}>
          {children}
        </div>
      </div>
    </Tooltip>
  );
};

PermissionsChecker.defaultProps = {
  experimentId: null,
  grayedOut: true,
  projectType: 'experiment',
};

PermissionsChecker.propTypes = {
  children: PropTypes.node.isRequired,
  permissions: PropTypes.string.isRequired,
  experimentId: PropTypes.string,
  grayedOut: PropTypes.bool,
  projectType: PropTypes.string,
};

export default PermissionsChecker;

export { notAllowedMessage };
