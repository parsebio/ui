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

  const [ctSpecies, setCtSpecies] = useState(null);
  const [ctTissue, setCtTissue] = useState(null);
  const [ctModel, setCtModel] = useState(null);

  const celltypistModelList = useMemo(() => (
    (celltypistModels.models || [])
      .filter((model) => model.display_name && model.species && model.tissue)
  ), []);

  const speciesOptions = useMemo(() => (
    _.uniq(celltypistModelList.map((model) => model.species)).sort()
  ), [celltypistModelList]);

  const tissueOptions = useMemo(() => {
    if (!ctSpecies) return [];

    return _.uniq(
      celltypistModelList.filter((model) => model.species === ctSpecies)
        .map((model) => model.tissue),
    ).sort();
  }, [celltypistModelList, ctSpecies]);

  const modelOptions = useMemo(() => {
    if (!(ctSpecies && ctTissue)) return [];

    return celltypistModelList
      .filter((model) => model.species === ctSpecies && model.tissue === ctTissue)
      .map((model) => ({ label: model.display_name, value: model.display_name }));
  }, [celltypistModelList, ctSpecies, ctTissue]);

  const selectedModelObj = useMemo(() => (
    celltypistModelList.find((model) => (
      model.display_name === ctModel
      && model.species === ctSpecies
      && model.tissue === ctTissue
    ))
  ), [celltypistModelList, ctModel, ctSpecies, ctTissue]);

  useEffect(() => {
    setCtTissue(null);
    setCtModel(null);
  }, [ctSpecies]);

  useEffect(() => {
    setCtModel(null);
  }, [ctTissue]);

  return (
    <Space direction='vertical'>
      <>
        <Space direction='vertical' style={{ width: '100%' }}>
          Species:
          <Select
            showSearch
            style={{ width: '100%' }}
            options={speciesOptions.map((option) => ({ label: option, value: option }))}
            value={ctSpecies}
            placeholder='Select a species'
            onChange={setCtSpecies}
          />
        </Space>
        <Space direction='vertical' style={{ width: '100%' }}>
          Tissue:
          <Select
            showSearch
            style={{ width: '100%' }}
            options={tissueOptions.map((option) => ({ label: option, value: option }))}
            value={ctTissue}
            placeholder='Select a tissue type'
            onChange={setCtTissue}
            disabled={!ctSpecies}
          />
        </Space>
        <Space direction='vertical' style={{ width: '100%' }}>
          Model:
          <Select
            showSearch
            style={{ width: '100%' }}
            options={modelOptions}
            value={ctModel}
            placeholder='Select a model'
            onChange={setCtModel}
            disabled={!ctTissue}
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
        disabled={_.isNil(ctSpecies) || _.isNil(ctTissue) || _.isNil(ctModel)}
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
