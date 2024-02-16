/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import {
  Select, Space,
} from 'antd';
import propTypes from 'prop-types';

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

  const refGenomes = ['Human: GRCh38', 'Mouse: GRCm39'];
  const refGenomeOptions = refGenomes.map((genome) => ({ label: genome, value: genome }));
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
