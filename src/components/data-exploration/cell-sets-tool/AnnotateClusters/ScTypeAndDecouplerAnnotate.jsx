import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Button,
  Radio, Select, Space, Tooltip, Alert,
} from 'antd';
import { runCellSetsAnnotation } from 'redux/actions/cellSets';
import { useDispatch, useSelector } from 'react-redux';
import { getCellSets } from 'redux/selectors';

const ScTypeTooltipText = (
  <>
    Uses ScType, a marker gene-based tool developed by Aleksandr Ianevski et al.
    It uses a marker genes database which was built using
    {' '}
    <a target='_blank' href='http://biocc.hrbmu.edu.cn/CellMarker/' rel='noreferrer'>CellMarker</a>
    ,
    {' '}
    <a target='_blank' href='https://panglaodb.se/' rel='noreferrer'>PanglaoDB</a>
    ,
    and 15 novel cell types with corresponding marker genes added by manual
    curation of more than 10 papers.
    The current version of the ScType database contains a total of 3,980 cell
    markers for 194 cell types in 17 human tissues and 4,212 cell markers for
    194 cell types in 17 mouse tissues.
    More details can be found in
    {' '}
    <a target='_blank' href='https://www.nature.com/articles/s41467-022-28803-w' rel='noreferrer'>the ScType paper</a>
    {' '}
    and in
    {' '}
    <a target='_blank' href='https://github.com/IanevskiAleksandr/sc-type' rel='noreferrer'>the ScType github repo</a>
    .
  </>
);

const DecouplerTooltipText = (
  <>
    Uses the
    {' '}
    {' '}
    <a target='_blank' href='https://doi.org/10.2307/2340521' rel='noreferrer'>
      Overrepresentation Analysis (ORA)
    </a>
    {' '}
    method implemented in decoupler-py. ORA measures the overlap between a target feature set
    {' '}
    (the marker genes in the
    <a target='_blank' href='https://panglaodb.se/' rel='noreferrer'> PanglaoDB</a>
    {' '}
    database)
    and the marker genes of a given experiment. With these, a contingency table
    is built and a one-tailed Fisher&apos;s exact test is computed to determine if a
    cell type&apos;s set of features are over-represented in the selected features from the data.

    More details can be found in the
    {' '}
    <a target='_blank' href='https://decoupler-py.readthedocs.io/en/latest/' rel='noreferrer'>
      decoupler documentation
    </a>
    , and on the original paper.

    <br />
    <br />
    Badia-i-Mompel P., Vélez Santiago J., Braunger J., Geiss C., Dimitrov D.,
    Müller-Dott S., Taus P., Dugourd A., Holland C.H., Ramirez Flores R.O.
    and Saez-Rodriguez J. 2022.
    decoupleR: Ensemble of computational methods to infer biological activities from omics data.
    Bioinformatics Advances.
    {' '}
    <a target='_blank' href='https://doi.org/10.1093/bioadv/vbac016' rel='noreferrer'>
      https://doi.org/10.1093/bioadv/vbac016
    </a>
  </>
);

const annotationTools = {
  sctype: {
    label: 'ScType',
    tooltip: ScTypeTooltipText,
    tissueOptions: [
      'Immune system', 'Pancreas', 'Liver', 'Eye', 'Kidney', 'Brain',
      'Lung', 'Adrenal', 'Heart', 'Intestine', 'Muscle', 'Placenta',
      'Spleen', 'Stomach', 'Thymus', 'Hippocampus',
    ],
  },
  decoupler: {
    label: 'Decoupler',
    tooltip: DecouplerTooltipText,
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
  'human',
  'mouse',
];

const AnnotateClustersTool = ({ experimentId, onRunAnnotation, selectedTool }) => {
  const dispatch = useDispatch();

  // Shared state for other tools
  const [tissue, setTissue] = useState(null);
  const [species, setSpecies] = useState(null);

  const cellSets = useSelector(getCellSets());

  const allClustersValid = useMemo(() => Object.entries(cellSets.properties)
    .every(([, value]) => value.parentNodeKey !== 'louvain' || value.cellIds.size > 1), [cellSets]);

  const currentTool = annotationTools[selectedTool];

  return (
    <Space direction='vertical'>
      <Radio.Group
        value={selectedTool}
        onChange={() => {
          setTissue(null);
          setSpecies(null);
        }}
      >
        {Object.entries(annotationTools).map(([key, tool]) => (
          <Tooltip title={tool.tooltip} key={key} placement='left' mouseEnterDelay={0.5}>
            <Radio value={key}>{tool.label}</Radio>
          </Tooltip>
        ))}
      </Radio.Group>

      <>
        <Space direction='vertical' style={{ width: '100%' }}>
          Species:
          <Select
            showSearch
            style={{ width: '100%' }}
            options={speciesOptions.map((option) => ({ label: option, value: option }))}
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
              annotationTools[selectedTool].label,
              methodParams,
            ));
            onRunAnnotation();
          }}
          disabled={_.isNil(tissue) || _.isNil(species) || !allClustersValid}
          style={{ marginTop: '20px' }}
        >
          Compute
        </Button>
      </>

    </Space>
  );
};

AnnotateClustersTool.defaultProps = {};

AnnotateClustersTool.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onRunAnnotation: PropTypes.func.isRequired,
  selectedTool: PropTypes.string.isRequired,
};

export default AnnotateClustersTool;
