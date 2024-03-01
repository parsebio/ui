/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import {
  Select,
} from 'antd';
import propTypes from 'prop-types';

import genomes from 'utils/genomes.json';

const genomeOptions = genomes.map((genome) => ({ label: genome, value: genome }));

const SelectReferenceGenome = (props) => {
  const { secondaryAnalysis, onDetailsChanged } = props;
  const [refGenome, setRefGenome] = useState();
  useEffect(() => {
    setRefGenome(secondaryAnalysis.refGenome);
  }, [secondaryAnalysis]);

  const changeRefGenome = (value) => {
    let newDiff = {};
    if (secondaryAnalysis.refGenome !== value) {
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
SelectReferenceGenome.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  secondaryAnalysis: propTypes.object.isRequired,
};

export default SelectReferenceGenome;
