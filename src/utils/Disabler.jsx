import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from 'antd';

const Disabler = ({ children, disable, tooltipText }) => {
  if (!disable) return children;

  return (
    <Tooltip title={tooltipText}>
      <div>
        <div disabled style={{ pointerEvents: 'none', opacity: 0.5 }}>
          {children}
        </div>
      </div>
    </Tooltip>
  );
};

Disabler.propTypes = {
  children: PropTypes.node,
  disable: PropTypes.bool.isRequired,
  tooltipText: PropTypes.string,
};

Disabler.defaultProps = {
  children: null,
  tooltipText: null,
};

export default Disabler;
