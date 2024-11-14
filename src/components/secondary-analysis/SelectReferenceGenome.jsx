/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Select,
  Typography,
} from 'antd';
import propTypes from 'prop-types';
import _ from 'lodash';

import genomes from 'utils/genomes.json';

const { Text } = Typography;

const SelectReferenceGenome = (props) => {
  const { previousGenome, onDetailsChanged } = props;
  const [refGenome, setRefGenome] = useState();
  const [options, setOptions] = useState(genomes.map((genome) => ({ label: `${genome.name}: ${genome.species}`, value: genome.name })));

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

  const debouncedSetOptions = useCallback(
    _.debounce((value) => {
      if (!value) {
        setOptions(genomes.map((genome) => ({ label: `${genome.name}: ${genome.species}`, value: genome.name })));
      } else {
        const searchRegex = new RegExp(value, 'i');
        const filteredGenomes = genomes.filter(
          (genome) => searchRegex.test(genome.name) || searchRegex.test(genome.species),
        );
        setOptions(filteredGenomes.map((genome) => ({ label: `${genome.name}: ${genome.species}`, value: genome.name })));
      }
    }, 400),
    [],
  );

  const handleSearch = (value) => {
    debouncedSetOptions(value);
  };

  return (
    <>
      <div style={{
        display: 'flex', flexDirection: 'column', height: '17vh',
      }}
      >
        <div>
          Select the reference genome:
        </div>
        <br />
        <Select
          showSearch
          style={{ width: '90%' }}
          value={refGenome}
          placeholder='Select the reference genome'
          onChange={changeRefGenome}
          onSearch={handleSearch}
          options={options}
          filterOption={false}
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
    </>
  );
};
SelectReferenceGenome.defaultProps = {
  previousGenome: '',
};
SelectReferenceGenome.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  previousGenome: propTypes.string,
};

export default SelectReferenceGenome;
