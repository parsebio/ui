import React from 'react';

const keyToTitle = {
  numOfSamples: 'Number of samples',
  numOfSublibraries: 'Number of sublibraries',
  chemistryVersion: 'Chemistry version',
  kit: 'Kit type',
  name: 'File name',
  status: 'Status',
  createdAt: 'Uploaded at',
};

const secondarySettingDetails = (detailsObj) => {
  const view = Object.keys(detailsObj).map((key) => {
    const value = detailsObj[key];
    const title = keyToTitle[key];
    return (
      <div
        key={key}
        style={{
          display: 'flex',
          marginBottom: window.innerHeight > 850 ? '0.6vh' : '0',
        }}
      >
        {title && (
          <span style={{ fontWeight: 'bold', fontSize: '1.4vh' }}>
            {`${title}:`}
          </span>
        )}
        &nbsp;
        <span style={{
          fontSize: '1.4vh', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
        >
          {value || 'Not selected'}
        </span>
      </div>
    );
  });
  return view;
};

export default secondarySettingDetails;
