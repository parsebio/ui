import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Button, Select, Space, Alert,
} from 'antd';
import { runCellSetsAnnotation } from 'redux/actions/cellSets';
import { useDispatch, useSelector } from 'react-redux';
import { getCellSets } from 'redux/selectors';

const annotationTools = {
  sctype: {
    value: 'ScType',
    tissueOptions: [
      'Immune system', 'Pancreas', 'Liver', 'Eye', 'Kidney', 'Brain',
      'Lung', 'Adrenal', 'Heart', 'Intestine', 'Muscle', 'Placenta',
      'Spleen', 'Stomach', 'Thymus', 'Hippocampus',
    ],
  },
  decoupler: {
    value: 'Decoupler',
    tissueOptions: [
      'Immune system', 'Oral cavity', 'Brain', 'Kidney', 'Reproductive',
      'Epithelium', 'GI tract', 'Thymus', 'Olfactory system', 'Placenta',
      'Lungs', 'Liver', 'Zygote', 'Blood', 'Bone', 'Vasculature',
      'Pancreas', 'Heart', 'Mammary gland', 'Connective tissue',
      'Skeletal muscle', 'Skin', 'Embryo', 'Smooth muscle', 'Eye',
      'Adrenal glands', 'Thyroid', 'Parathyroid glands', 'Urinary bladder',
    ],
  },
};

const speciesOptions = [
  { label: 'human', value: 'human' },
  { label: 'mouse', value: 'mouse' },
];

const ScTypeAndDecouplerAnnotate = ({ experimentId, onRunAnnotation, selectedTool }) => {
  const dispatch = useDispatch();

  // Shared state for other tools
  const [tissue, setTissue] = useState(null);
  const [species, setSpecies] = useState(null);

  const cellSets = useSelector(getCellSets());

  const allClustersValid = useMemo(() => (
    Object.entries(cellSets.properties)
      .every(([, value]) => value.parentNodeKey !== 'louvain' || value.cellIds.size > 1)
  ), [cellSets]);

  const currentTool = annotationTools[selectedTool];

  return (
    <Space direction='vertical'>
      <Space direction='vertical' style={{ width: '100%' }}>
        Species:
        <Select
          showSearch
          style={{ width: '100%' }}
          options={speciesOptions}
          value={species}
          placeholder='Select a species'
          onChange={setSpecies}
        />
      </Space>
      <Space direction='vertical' style={{ width: '100%' }}>
        Tissue Type:
        <Select
          showSearch
          style={{ width: '100%' }}
          options={currentTool.tissueOptions
            .map((option) => ({ label: option, value: option }))}
          value={tissue}
          placeholder='Select a tissue type'
          onChange={setTissue}
        />
      </Space>
      {!allClustersValid && (
        <Alert
          message='There are some clusters with too few cells to compute annotations. Try increasing the clustering resolution value.'
          type='info'
          showIcon
        />
      )}

      <Button
        onClick={() => {
          const methodParams = {
            species,
            tissue,
          };

          dispatch(runCellSetsAnnotation(
            experimentId,
            annotationTools[selectedTool].value,
            methodParams,
          ));
          onRunAnnotation();
        }}
        disabled={_.isNil(tissue) || _.isNil(species) || !allClustersValid}
        style={{ marginTop: '20px' }}
      >
        Compute
      </Button>
    </Space>
  );
};

ScTypeAndDecouplerAnnotate.defaultProps = {};

ScTypeAndDecouplerAnnotate.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onRunAnnotation: PropTypes.func.isRequired,
  selectedTool: PropTypes.oneOf(['sctype', 'decoupler']).isRequired,
};

export default ScTypeAndDecouplerAnnotate;
