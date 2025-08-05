import React, { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';

const NonParseBanner = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: '#FFEB3B', // yellow
        color: '#333',
        textAlign: 'center',
        padding: '12px 0',
        fontSize: '1.1em',
        fontWeight: 500,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <span>
        Evercode™ split-pool combinatorial barcoding enables
        you to scale up your single cell projects
        to millions of cells or nuclei.
        {' '}
        <a
          href='https://www.parsebiosciences.com/technology/'
          target='_blank'
          rel='noopener noreferrer'
          style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
        >
          Learn more
        </a>
        {' '}
        about how the technology uniquely labels cells without
        ever needing to isolate individual cells.
      </span>
      <span
        style={{
          position: 'absolute',
          right: 16,
          top: 12,
          cursor: 'pointer',
        }}
        onClick={() => setVisible(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setVisible(false);
          }
        }}
        aria-label='Close banner'
        role='button'
        tabIndex={0}
      >
        <CloseOutlined style={{ fontSize: '18px', color: '#333' }} />
      </span>
    </div>
  );
};

export default NonParseBanner;
