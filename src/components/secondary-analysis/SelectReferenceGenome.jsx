/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import {
  Select,
  Typography,
} from 'antd';
import propTypes from 'prop-types';

import genomes from 'utils/genomes.json';

const { Text } = Typography;

const options = genomes.map((genome) => ({ label: `${genome.name}: ${genome.species}`, value: genome.name }));

const SelectReferenceGenome = (props) => {
  const { previousGenome, onDetailsChanged } = props;

  const [refGenome, setRefGenome] = useState();

  useEffect(() => {
    setRefGenome(previousGenome);
  }, []);

  const changeRefGenome = (value) => {
    let newDiff = {};
    if (previousGenome !== value) {
      newDiff = { refGenome: value };
    }
    onDetailsChanged(newDiff);
    setRefGenome(value);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '17vh',
    }}
    >
      <div>
        Select the reference genome for aligning your whole transcriptome data:
      </div>
      <br />
      <Select
        showSearch
        style={{ width: '90%' }}
        value={refGenome}
        placeholder='Select the reference genome'
        onChange={changeRefGenome}
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
SelectReferenceGenome.defaultProps = {
  previousGenome: undefined,
};
SelectReferenceGenome.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  previousGenome: propTypes.string,
};

export default SelectReferenceGenome;
