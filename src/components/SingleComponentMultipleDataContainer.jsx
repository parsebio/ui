/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';
import { Virtuoso } from 'react-virtuoso';

// Custom collapsible panel component
const VirtualizedPanel = ({
  headerName, children, isActive, onToggle,
}) => (
  <div className='virtualized-panel'>
    <div
      className='virtualized-panel-header'
      onClick={onToggle}
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

VirtualizedPanel.propTypes = {
  headerName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const SingleComponentMultipleDataContainer = ({ inputsList, baseComponentRenderer }) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState('100%');
  const [panelStates, setPanelStates] = useState({});

  // get the available height for the component
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top;
        setContainerHeight(availableHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const togglePanel = (key) => {
    setPanelStates((prevStates) => ({
      ...prevStates,
      [key]: !prevStates[key],
    }));
  };

  if (!inputsList.length) return <Empty />;

  return (
    <div ref={containerRef}>
      <Virtuoso
        data={inputsList}
        itemContent={(index, { key, headerName, params }) => (
          <VirtualizedPanel
            key={key}
            headerName={headerName}
            isActive={panelStates[key] !== false}
            onToggle={() => togglePanel(key)}
          >
            {baseComponentRenderer(params)}
          </VirtualizedPanel>
        )}
        style={{ height: containerHeight }}
      />
    </div>
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
