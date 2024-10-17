import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Empty } from 'antd';

const { Panel } = Collapse;

const SingleComponentMultipleDataContainer = (props) => {
  const { inputsList, baseComponentRenderer } = props;

  // First 50 dropdowns are open by default
  const [activeKey, setActiveKey] = useState(inputsList.slice(0, 50).map(({ key }) => key));

  useEffect(() => {
    const newKeys = inputsList.map(({ key }) => key);
    setActiveKey(newKeys);
  }, [inputsList]);

  const handleCollapseChange = (keys) => {
    setActiveKey(keys);
  };

  if (!inputsList.length) return <Empty />;

  return (
    <Collapse activeKey={activeKey} onChange={handleCollapseChange}>
      {inputsList.map(({ key, headerName, params }) => (
        <Panel header={headerName} key={key}>
          {baseComponentRenderer(params)}
        </Panel>
      ))}
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
