import React from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';

const { Panel } = Collapse;

const SingleComponentMultipleDataContainer = (props) => {
  const {
    inputsList, baseComponentRenderer,
  } = props;

  const defaultActiveKey = inputsList.length > 0 ? [inputsList[0].key] : [];

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
