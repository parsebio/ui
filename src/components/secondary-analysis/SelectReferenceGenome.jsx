/* eslint-disable no-param-reassign */
import React from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import {
  Divider, Select, Tooltip, Typography,
} from 'antd';
import propTypes from 'prop-types';
import { getGenomeById } from 'redux/selectors';

import useLocalState from 'utils/customHooks/useLocalState';

import GenomeCreator from 'components/secondary-analysis/GenomeCreator';

const { Title } = Typography;

const SelectReferenceGenome = ({
  genomeId,
  secondaryAnalysisDiffRef,
  genomeDiffRef,
  secondaryAnalysisId,
}) => {
  const [localGenome, updateGenome] = useLocalState(
    (value) => {
      secondaryAnalysisDiffRef.current = { refGenomeId: value };
    },
    genomeId,
  );

  const { public: publicGenomes, custom: customGenomes } = useSelector((state) => state.genomes);

  const options = [
    ...Object.values(publicGenomes),
    ...Object.values(customGenomes),
  ].map((currentGenome) => ({
    label: `${currentGenome.name}: ${currentGenome.description}`,
    value: currentGenome.id,
  }));

  // a genome is stored if it has any uploaded input files
  const selectedGenome = useSelector(getGenomeById(localGenome));

  const isCustomGenomeSaved = selectedGenome
    && !selectedGenome.built && !_.isEmpty(selectedGenome.files);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div>
        <Tooltip title='Select the reference genome for aligning your whole transcriptome data.'>
          <Title level={5}>Select the reference genome:</Title>
        </Tooltip>
      </div>
      <Select
        showSearch
        style={{ width: '90%' }}
        value={localGenome}
        disabled={isCustomGenomeSaved}
        placeholder='Select the reference genome'
        onChange={updateGenome}
        options={options}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      />
      <Divider> OR </Divider>
      <Title level={5}>Add files for new genome generation:</Title>
      <GenomeCreator
        genomeId={localGenome}
        updateGenome={updateGenome}
        genomeDiffRef={genomeDiffRef}
        secondaryAnalysisId={secondaryAnalysisId}
      />
    </div>
  );
};

SelectReferenceGenome.defaultProps = {
  genomeId: undefined,
};

SelectReferenceGenome.propTypes = {
  secondaryAnalysisDiffRef: propTypes.func.isRequired,
  genomeId: propTypes.string,
  secondaryAnalysisId: propTypes.string.isRequired,
  genomeDiffRef: propTypes.shape({
    current: propTypes.object,
  }).isRequired,
};

export default SelectReferenceGenome;
