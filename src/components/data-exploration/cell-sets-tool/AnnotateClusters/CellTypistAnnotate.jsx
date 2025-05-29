import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Button, Select, Space, Alert,
} from 'antd';
import { runCellSetsAnnotation } from 'redux/actions/cellSets';
import { useDispatch, useSelector } from 'react-redux';
import { getCellSets } from 'redux/selectors';
import celltypistModels from 'components/data-exploration/cell-sets-tool/AnnotateClusters/celltypistModels.json';

const annotationTools = {
  celltypist: {
    label: 'CellTypist',
    tooltip: 'Runs CellTypist cell type annotation.',
  },
};

const CellTypistAnnotate = ({ experimentId, onRunAnnotation }) => {
  const dispatch = useDispatch();

  // Celltypist-specific state
  const [ctSpecies, setCtSpecies] = useState(null);
  const [ctTissue, setCtTissue] = useState(null);
  const [ctModel, setCtModel] = useState(null);

  const cellSets = useSelector(getCellSets());

  const allClustersValid = useMemo(() => Object.entries(cellSets.properties)
    .every(([, value]) => value.parentNodeKey !== 'louvain' || value.cellIds.size > 1), [cellSets]);

  // --- Celltypist filtering logic ---
  const celltypistModelList = useMemo(
    () => (celltypistModels.models || [])
      .filter((m) => m.display_name && m.species && m.tissue),
    [],
  );

  const ctSpeciesOptions = useMemo(
    () => _.uniq(celltypistModelList.map((m) => m.species)).sort(),
    [celltypistModelList],
  );
  const ctTissueOptions = useMemo(
    () => {
      if (!ctSpecies) return [];
      return _.uniq(
        celltypistModelList.filter((m) => m.species === ctSpecies)
          .map((m) => m.tissue),
      ).sort();
    },
    [celltypistModelList, ctSpecies],
  );
  const ctModelOptions = useMemo(
    () => {
      if (!ctSpecies || !ctTissue) return [];
      return celltypistModelList
        .filter((m) => m.species === ctSpecies && m.tissue === ctTissue)
        .map((m) => ({ label: m.display_name, value: m.display_name }));
    },
    [celltypistModelList, ctSpecies, ctTissue],
  );
  const selectedCtModelObj = useMemo(
    () => celltypistModelList.find(
      (m) => m.display_name === ctModel && m.species === ctSpecies && m.tissue === ctTissue,
    ),
    [celltypistModelList, ctModel, ctSpecies, ctTissue],
  );

  // Reset dependent selections if parent changes
  React.useEffect(() => {
    setCtTissue(null);
    setCtModel(null);
  }, [ctSpecies]);
  React.useEffect(() => {
    setCtModel(null);
  }, [ctTissue]);

  // --- Render ---
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
      {!allClustersValid && (
        <Alert
          message='There are some clusters with too few cells to compute annotations. Try increasing the clustering resolution value.'
          type='info'
          showIcon
        />
      )}
      <Button
        onClick={() => {
          // For celltypist, send only the model URL minus the common prefix as 'tissue' param.
          // Species should be null
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
            annotationTools.celltypist.label,
            methodParams,
          ));
          onRunAnnotation();
        }}
        disabled={_.isNil(ctSpecies) || _.isNil(ctTissue) || _.isNil(ctModel) || !allClustersValid}
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
