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
      .filter((m) => m.display_name && m.species && m.tissue)
  ), []);

  const ctSpeciesOptions = useMemo(() => (
    _.uniq(celltypistModelList.map((m) => m.species)).sort()
  ), [celltypistModelList]);

  const ctTissueOptions = useMemo(() => {
    if (!ctSpecies) return [];

    return _.uniq(
      celltypistModelList.filter((m) => m.species === ctSpecies)
        .map((m) => m.tissue),
    ).sort();
  }, [celltypistModelList, ctSpecies]);

  const ctModelOptions = useMemo(() => {
    if (!ctSpecies || !ctTissue) return [];
    return celltypistModelList
      .filter((m) => m.species === ctSpecies && m.tissue === ctTissue)
      .map((m) => ({ label: m.display_name, value: m.display_name }));
  }, [celltypistModelList, ctSpecies, ctTissue]);

  const selectedCtModelObj = useMemo(() => (
    celltypistModelList.find(
      (m) => m.display_name === ctModel && m.species === ctSpecies && m.tissue === ctTissue,
    )), [celltypistModelList, ctModel, ctSpecies, ctTissue]);

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
            options={ctSpeciesOptions.map((option) => ({ label: option, value: option }))}
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
            options={ctTissueOptions.map((option) => ({ label: option, value: option }))}
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
            options={ctModelOptions}
            value={ctModel}
            placeholder='Select a model'
            onChange={setCtModel}
            disabled={!ctTissue}
          />
        </Space>
        {selectedCtModelObj && selectedCtModelObj.source && (
          <div style={{ marginTop: 8 }}>
            Source:
            <br />
            <a href={selectedCtModelObj.source} target='_blank' rel='noreferrer'>
              {selectedCtModelObj.source}
            </a>
          </div>
        )}
      </>

      <Button
        onClick={() => {
          const CellTypistUrlPrefix = 'https://celltypist.cog.sanger.ac.uk/models/';
          let modelKey = null;
          if (
            selectedCtModelObj
            && selectedCtModelObj.url
            && selectedCtModelObj.url.startsWith(CellTypistUrlPrefix)
          ) {
            modelKey = selectedCtModelObj.url.substring(CellTypistUrlPrefix.length);
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
