/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Select,
  Typography,
} from 'antd';
import propTypes from 'prop-types';

import genomes from 'utils/genomes.json';
import useLocalState from 'utils/customHooks/useLocalState';

const { Text } = Typography;

const options = genomes.map((genome) => ({ label: `${genome.name}: ${genome.species}`, value: genome.name }));

const SelectReferenceGenome = (props) => {
  const { genome, onDetailsChanged } = props;

  const [localGenome, updateGenome] = useLocalState(
    (value) => onDetailsChanged({ refGenome: value }),
    genome,
  );

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
        value={localGenome}
        placeholder='Select the reference genome'
        onChange={updateGenome}
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
  genome: undefined,
};
SelectReferenceGenome.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  genome: propTypes.string,
};

export default SelectReferenceGenome;
