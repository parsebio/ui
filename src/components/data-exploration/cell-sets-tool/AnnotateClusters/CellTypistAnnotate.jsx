import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Button, Select, Space,
} from 'antd';
import { runCellSetsAnnotation } from 'redux/actions/cellSets';
import { useDispatch } from 'react-redux';
import celltypistModels from 'components/data-exploration/cell-sets-tool/AnnotateClusters/celltypistModels.json';

// TODO cleanup, no need for this object
const annotationTools = {
  celltypist: {
    value: 'CellTypist',
  },
};

const CellTypistAnnotate = ({ experimentId, onRunAnnotation }) => {
  const dispatch = useDispatch();

  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedTissue, setSelectedTissue] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const speciesOptions = useMemo(() => (
    _.uniq(celltypistModels.map((model) => model.species)).sort()
  ), [celltypistModels]);

  const tissueOptions = useMemo(() => {
    if (!selectedSpecies) return [];

    return _.uniq(
      celltypistModels.filter((model) => model.species === selectedSpecies)
        .map((model) => model.tissue),
    ).sort();
  }, [celltypistModels, selectedSpecies]);

  const modelOptions = useMemo(() => {
    if (!(selectedSpecies && selectedTissue)) return [];

    return celltypistModels
      .filter((model) => model.species === selectedSpecies && model.tissue === selectedTissue)
      .map((model) => ({ label: model.display_name, value: model.display_name }));
  }, [celltypistModels, selectedSpecies, selectedTissue]);

  const selectedModelObj = useMemo(() => (
    celltypistModels.find((model) => (
      model.display_name === selectedModel
      && model.species === selectedSpecies
      && model.tissue === selectedTissue
    ))
  ), [celltypistModels, selectedModel, selectedSpecies, selectedTissue]);

  useEffect(() => {
    setSelectedTissue(null);
    setSelectedModel(null);
  }, [selectedSpecies]);

  useEffect(() => {
    setSelectedModel(null);
  }, [selectedTissue]);

  return (
    <Space direction='vertical'>
      <>
        <Space direction='vertical' style={{ width: '100%' }}>
          Species:
          <Select
            showSearch
            style={{ width: '100%' }}
            options={speciesOptions.map((option) => ({ label: option, value: option }))}
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
            options={tissueOptions.map((option) => ({ label: option, value: option }))}
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
            value={selectedModel}
            placeholder='Select a model'
            onChange={setSelectedModel}
            disabled={!selectedTissue}
          />
        </Space>
        {selectedModelObj && selectedModelObj.source && (
          <div style={{ marginTop: 8 }}>
            Source:
            <br />
            <a href={selectedModelObj.source} target='_blank' rel='noreferrer'>
              {selectedModelObj.source}
            </a>
          </div>
        )}
      </>

      <Button
        onClick={() => {
          const CellTypistUrlPrefix = 'https://celltypist.cog.sanger.ac.uk/models/';
          let modelKey = null;
          if (
            selectedModelObj
            && selectedModelObj.url
            && selectedModelObj.url.startsWith(CellTypistUrlPrefix)
          ) {
            modelKey = selectedModelObj.url.substring(CellTypistUrlPrefix.length);
          }
          const methodParams = {
            modelKey,
          };
          dispatch(runCellSetsAnnotation(
            experimentId,
            annotationTools.celltypist.value,
            methodParams,
          ));
          onRunAnnotation();
        }}
        disabled={_.isNil(selectedSpecies) || _.isNil(selectedTissue) || _.isNil(selectedModel)}
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
