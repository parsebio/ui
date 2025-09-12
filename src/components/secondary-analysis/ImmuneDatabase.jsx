/* eslint-disable no-return-assign */
import React, { useMemo } from 'react';
import { Select } from 'antd';
import propTypes from 'prop-types';

import useLocalState from 'utils/customHooks/useLocalState';
import KitCategory, { immuneDbOptionsByKitCategory } from 'const/enums/KitCategory';

const immuneDbToDisplay = {
  human: 'Human',
  mouse: 'Mouse',
  transgenic_mouse: 'Transgenic mouse',
};

const ImmuneDatabase = (props) => {
  const { database, kitCategory, secondaryAnalysisDiffRef } = props;

  const [localDatabase, updateDatabase] = useLocalState(
    (value) => secondaryAnalysisDiffRef.current = { immuneDatabase: value },
    database,
  );

  const options = useMemo(
    () => immuneDbOptionsByKitCategory[kitCategory].map((type) => ({
      label: immuneDbToDisplay[type],
      value: type,
    })),
    [kitCategory],
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
    }}
    >
      <div>
        Select the database:
      </div>
      <br />
      <Select
        showSearch
        style={{ width: '90%' }}
        value={localDatabase}
        placeholder='Select the database'
        onChange={updateDatabase}
        options={options}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      />
    </div>
  );
};

ImmuneDatabase.propTypes = {
  secondaryAnalysisDiffRef: propTypes.shape({
    current: propTypes.object,
  }).isRequired,
  database: propTypes.string.isRequired,
  kitCategory: propTypes.oneOf([KitCategory.TCR, KitCategory.BCR]).isRequired,
};

export default ImmuneDatabase;

export { immuneDbToDisplay };
