import React from 'react';
import PropTypes from 'prop-types';

import { Collapse } from 'antd';

const { Panel } = Collapse;

const SingleComponentMultipleDataContainer = (props) => {
  const {
    inputsList, baseComponentRenderer,
  } = props;

  // First 50 dropdowns are open by default
  const defaultActiveKey = inputsList.slice(0, 50).map(({ key }) => key);

  return (
    <Collapse defaultActiveKey={defaultActiveKey}>
      {
        inputsList.map(({ key, headerName, params }) => (
          <Panel header={headerName} key={key}>
            {baseComponentRenderer(params)}
          </Panel>
        ))
      }
    </Collapse>
  );
};

SingleComponentMultipleDataContainer.propTypes = {
  inputsList: PropTypes.array,
  baseComponentRenderer: PropTypes.func.isRequired,
};

SingleComponentMultipleDataContainer.defaultProps = {
  inputsList: [],
};

export default SingleComponentMultipleDataContainer;
