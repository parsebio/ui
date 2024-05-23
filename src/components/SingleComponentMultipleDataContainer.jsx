import React from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';
import { FixedSizeList as List } from 'react-window';

const { Panel } = Collapse;

const SingleComponentMultipleDataContainer = (props) => {
  const {
    defaultActiveKey, inputsList, baseComponentRenderer,
  } = props;

  const Row = ({ index, style }) => {
    const { key, headerName, params } = inputsList[index];
    return (
      <div style={style} key={key}>
        <Collapse defaultActiveKey={defaultActiveKey}>
          <Panel header={headerName} key={key}>
            {baseComponentRenderer(params)}
          </Panel>
        </Collapse>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <List
        height={window.innerHeight} // or any fixed height you prefer
        itemCount={inputsList.length}
        itemSize={600}
        width='100%'
      >
        {Row}
      </List>
    </div>
  );
};

SingleComponentMultipleDataContainer.propTypes = {
  defaultActiveKey: PropTypes.array,
  inputsList: PropTypes.array,
  baseComponentRenderer: PropTypes.func.isRequired,
};

SingleComponentMultipleDataContainer.defaultProps = {
  defaultActiveKey: '',
  inputsList: [],
};

export default SingleComponentMultipleDataContainer;
