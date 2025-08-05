import React from 'react';

const NonParseBanner = () => {
  const a = 1;

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
      Evercode™ split-pool combinatorial barcoding enables you to scale up your single cell projects
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
    </div>
  );
};

export default NonParseBanner;
