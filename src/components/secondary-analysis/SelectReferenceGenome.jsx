/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import {
  Select,
} from 'antd';
import propTypes from 'prop-types';

import genomes from 'utils/genomes.json';

const genomeOptions = genomes.map((genome) => ({ label: `${genome.name}: ${genome.species}`, value: genome.name }));

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
    <>
      <div>
        Select the reference genome:
      </div>
      <br />
      <Select
        style={{ marginLeft: '10px', width: '90%' }}
        value={refGenome}
        placeholder='Select the reference genome'
        onChange={changeRefGenome}
        options={genomeOptions}
      />
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
