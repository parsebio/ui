import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Tooltip,
} from 'antd';

import { permissions } from 'utils/constants';
import PermissionsChecker from 'utils/PermissionsChecker';
import ClusterPopover from 'components/data-exploration/embedding/ClusterPopover';

const CellSetOperation = (props) => {
  const {
    icon, helpTitle, onCreate, onCancel, ariaLabel,
  } = props;

  // Setting up `key` forces us to re-render the component when the user creates
  // or cancels an action. This ensures that the data from the previous state (e.g. name
  // given to a cluster) will not linger around for the next render.
  const [popoverKey, setPopoverKey] = useState(Math.random());

  return (
    <PermissionsChecker permissions={permissions.WRITE}>
      <ClusterPopover
        onCreate={(name, color) => {
          onCreate(name, color);
          setPopoverKey(Math.random());
        }}
        onCancel={() => {
          onCancel();
          setPopoverKey(Math.random());
        }}
        key={popoverKey}
        message={helpTitle}
        trigger='click'

      >
        <Tooltip title={helpTitle} trigger='click hover'>
          <Button aria-label={ariaLabel} type='dashed' icon={icon} size='small' />
        </Tooltip>
      </ClusterPopover>
    </PermissionsChecker>
  );
};

CellSetOperation.defaultProps = {
  onCreate: () => null,
  onCancel: () => null,
};

CellSetOperation.propTypes = {
  icon: PropTypes.object.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  helpTitle: PropTypes.string.isRequired,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
};

export default CellSetOperation;
