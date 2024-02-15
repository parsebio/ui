/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import {
  Form, Select,
} from 'antd';
import propTypes from 'prop-types';

const { Option } = Select;
const SelectReferenceGenome = (props) => {
  const { secondaryAnalysis, setNewSecondaryAnalysisDetailsDiff } = props;
  const [refGenome, setRefGenome] = useState();
  useEffect(() => {
    setRefGenome(secondaryAnalysis.refGenome);
  }, [secondaryAnalysis]);

  const changeRefGenome = (value) => {
    let newDiff = {};
    if (secondaryAnalysis.refGenome !== value) {
      newDiff = { refGenome: value };
    }
    setNewSecondaryAnalysisDetailsDiff(newDiff);
    setRefGenome(value);
  };
  console.log('REF GENOME IS ', refGenome, refGenome === 'Human');

  const refGenomes = ['Human', 'Mouse'];
  const refGenomeOptions = refGenomes.map((genome) => ({ label: genome, value: genome }));
  return (
    <>
      <div>
        Select the reference genome:
      </div>

      <Select
        style={{ marginLeft: '10px', width: '90%' }}
        value={refGenome}
        placeholder='Select the reference genome'
        onChange={(value) => changeRefGenome(value)}
        options={refGenomeOptions}
      />
    </>
  );
};
SelectReferenceGenome.propTypes = {
  setNewSecondaryAnalysisDetailsDiff: propTypes.func.isRequired,
  secondaryAnalysis: propTypes.object.isRequired,
};

export default SelectReferenceGenome;
