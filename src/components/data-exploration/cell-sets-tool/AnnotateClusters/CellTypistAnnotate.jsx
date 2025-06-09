import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, Select, Space } from 'antd';
import { runCellSetsAnnotation } from 'redux/actions/cellSets';
import { useDispatch } from 'react-redux';
import celltypistModels from 'components/data-exploration/cell-sets-tool/AnnotateClusters/celltypistModels.json';
import Tooltipped from 'utils/Tooltipped';

const CellTypistAnnotate = ({ experimentId, onRunAnnotation }) => {
  const dispatch = useDispatch();

  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedTissue, setSelectedTissue] = useState(null);
  const [selectedModelName, setSelectedModelName] = useState(null);

  const speciesOptions = useMemo(() => (
    _.uniq(celltypistModels.map((model) => model.species)).sort().map((option) => ({
      label: <Tooltipped text={option} />,
      value: option,
    }))
  ), []);

  const tissueOptions = useMemo(() => {
    if (_.isNil(selectedSpecies)) return [];

    return _.uniq(
      celltypistModels.filter((model) => model.species === selectedSpecies)
        .map((model) => model.tissue),
    ).sort().map((option) => ({
      label: <Tooltipped text={option} />,
      value: option,
    }));
  }, [selectedSpecies]);

  const modelOptions = useMemo(() => (
    celltypistModels
      .filter((model) => model.species === selectedSpecies && model.tissue === selectedTissue)
      .map(({ displayName }) => ({
        label: <Tooltipped text={displayName} />,
        value: displayName,
      }))
  ), [selectedSpecies, selectedTissue]);

  const selectedModel = useMemo(() => (
    celltypistModels.find((model) => model.displayName === selectedModelName)
  ), [selectedModelName]);

  useEffect(() => {
    setSelectedTissue(null);
  }, [selectedSpecies]);

  useEffect(() => {
    setSelectedModelName(null);
  }, [selectedTissue]);

  return (
    <Space direction='vertical'>
      <Space direction='vertical' style={{ width: '250px' }}>
        Species:
        <Select
          showSearch
          style={{ width: '100%' }}
          options={speciesOptions}
          value={selectedSpecies}
          placeholder='Select a species'
          onChange={setSelectedSpecies}
        />
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        Tissue:
        <Select
          showSearch
          style={{ width: '100%' }}
          options={tissueOptions}
          value={selectedTissue}
          placeholder='Select a tissue type'
          onChange={setSelectedTissue}
          disabled={!selectedSpecies}
        />
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        Model:
        <Select
          showSearch
          style={{ width: '100%' }}
          options={modelOptions}
          value={selectedModelName}
          placeholder='Select a model'
          onChange={setSelectedModelName}
          disabled={!selectedTissue}
        />
      </Space>
      {selectedModel?.source && (
        <div style={{ marginTop: 8 }}>
          Source:
          <br />
          <a href={selectedModel.source} target='_blank' rel='noreferrer'>
            {selectedModel.source}
          </a>
        </div>
      )}

      <Button
        onClick={() => {
          const CellTypistUrlPrefix = 'https://celltypist.cog.sanger.ac.uk/models/';
          let modelKey = null;

          if (selectedModel?.url?.startsWith(CellTypistUrlPrefix)) {
            modelKey = selectedModel.url.substring(CellTypistUrlPrefix.length);
          }

          const methodParams = {
            modelKey,
          };

          dispatch(runCellSetsAnnotation(
            experimentId,
            'CellTypist',
            methodParams,
          ));
          onRunAnnotation();
        }}
        disabled={[selectedSpecies, selectedTissue, selectedModelName].some(_.isNil)}
        style={{ marginTop: '20px' }}
      >
        Compute
      </Button>
    </Space>
  );
};

CellTypistAnnotate.defaultProps = {};

CellTypistAnnotate.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onRunAnnotation: PropTypes.func.isRequired,
};

export default CellTypistAnnotate;
