/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';
import { Virtuoso } from 'react-virtuoso';

// Custom collapsible panel component
const VirtualizedPanel = ({
  headerName, children, isActive, onToggle,
}) => (
  <div>
    <div
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
    <div
      style={{
        maxHeight: isActive ? '2000px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-out',
        padding: isActive ? '10px' : '0px',
        borderBottom: isActive ? '1px solid #e8e8e8' : 'none',
      }}
    >
      {children}
    </div>
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
  const [containerHeight, setContainerHeight] = useState(813);
  const [closedPanels, setClosedPanels] = useState({});

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
    setClosedPanels((prevStates) => ({
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
            isActive={closedPanels[key] !== true}
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
