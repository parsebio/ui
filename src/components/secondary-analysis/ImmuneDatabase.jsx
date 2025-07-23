/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import {
  Select,
  Typography,
} from 'antd';
import propTypes from 'prop-types';

import FastqFileType from 'const/enums/FastqFileType';

const immuneDbToDisplay = {
  human: 'Human',
  mouse: 'Mouse',
  transgenic_mouse: 'Transgenic mouse',
};

const optionsByImmuneDb = {
  [FastqFileType.BCR]: ['human', 'mouse', 'transgenic_mouse'],
  [FastqFileType.TCR]: ['human', 'mouse'],
};

const { Text } = Typography;

const ImmuneDatabase = (props) => {
  const { database, immuneType, onDetailsChanged } = props;

  const options = useMemo(
    () => optionsByImmuneDb[immuneType].map((type) => ({
      label: immuneDbToDisplay[type],
      value: type,
    })),
    [immuneType],
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '17vh',
    }}
    >
      <div>
        Select the database:
      </div>
      <br />
      <Select
        showSearch
        style={{ width: '90%' }}
        value={database}
        placeholder='Select the database'
        onChange={(value) => onDetailsChanged({ immuneDatabase: value })}
        options={options}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      />
      <div style={{ marginTop: 'auto', marginBottom: '0.1em' }}>
        <Text type='secondary'>
          <i>
            If the genome you require is not available, please contact us at
            {' '}
            <a href='mailto:support@parsebiosciences.com'>support@parsebiosciences.com</a>
            .
          </i>
        </Text>
      </div>
    </div>
  );
};

ImmuneDatabase.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  database: propTypes.string.isRequired,
  immuneType: propTypes.oneOf([FastqFileType.TCR, FastqFileType.BCR]).isRequired,
};

export default ImmuneDatabase;

export { immuneDbToDisplay };
