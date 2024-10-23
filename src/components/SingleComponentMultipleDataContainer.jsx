import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';
import { Virtuoso } from 'react-virtuoso';

// Custom collapsible panel component
const VirtualizedPanel = ({ headerName, children }) => {
  const [isActive, setIsActive] = useState(true); // Panels are open by default

  const togglePanel = () => {
    setIsActive(!isActive);
  };

  return (
    <div className='virtualized-panel'>
      <div
        className='virtualized-panel-header'
        onClick={togglePanel}
        style={{
          background: '#f7f7f7',
          padding: '10px',
          cursor: 'pointer',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        {headerName}
      </div>
      {isActive && (
        <div
          className='virtualized-panel-content'
          style={{ padding: '10px', borderBottom: '1px solid #e8e8e8' }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

VirtualizedPanel.propTypes = {
  headerName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const SingleComponentMultipleDataContainer = ({ inputsList, baseComponentRenderer }) => {
  if (!inputsList.length) return <Empty />;

  return (
    <Virtuoso
      data={inputsList}
      itemContent={(index, { key, headerName, params }) => (
        <VirtualizedPanel key={key} headerName={headerName}>
          {baseComponentRenderer(params)}
        </VirtualizedPanel>
      )}
      style={{ height: '80vh' }} // Adjust the height as needed
    />
  );
};

SingleComponentMultipleDataContainer.propTypes = {
  inputsList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      headerName: PropTypes.string.isRequired,
      params: PropTypes.object.isRequired,
    }),
  ),
  baseComponentRenderer: PropTypes.func.isRequired,
};

SingleComponentMultipleDataContainer.defaultProps = {
  inputsList: [],
};

export default SingleComponentMultipleDataContainer;
