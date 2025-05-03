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

const scTypeTooltipText = (
  <>
    Automatic annotation is performed using ScType, a marker gene-based tool
    developed by Aleksandr Ianevski et al.
    It uses a marker genes database which was build using
    {' '}
    <a target='_blank' href='http://biocc.hrbmu.edu.cn/CellMarker/' rel='noreferrer'>CellMarker</a>
    ,
    {' '}
    <a target='_blank' href='https://panglaodb.se/' rel='noreferrer'>PanglaoDB</a>
    ,
    and 15 novel cell types with corresponding marker genes added by
    manual curation of more than 10 papers.
    The current version of the ScType database contains a total of
    3,980 cell markers for 194 cell types in 17 human tissues and 4,212 cell markers
    for 194 cell types in 17 mouse tissues.
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

const annotationTools = {
  sctype: {
    label: 'ScType',
    tooltip: scTypeTooltipText,
    tissueOptions: [
      'Immune system', 'Pancreas', 'Liver', 'Eye', 'Kidney', 'Brain',
      'Lung', 'Adrenal', 'Heart', 'Intestine', 'Muscle', 'Placenta',
      'Spleen', 'Stomach', 'Thymus', 'Hippocampus',
    ],
  },
  decoupler: {
    label: 'Decoupler',
    tooltip: 'Runs decoupler-py ORA cluster annotation.',
    tissueOptions: [
      'Immune system', 'Oral cavity', 'Brain', 'Kidney', 'Reproductive',
      'Epithelium', 'GI tract', 'Thymus', 'Olfactory system', 'Placenta',
      'Lungs', 'Liver', 'Zygote', 'Blood', 'Bone', 'Vasculature',
      'Pancreas', 'Heart', 'Mammary gland', 'Connective tissue',
      'Skeletal muscle', 'Skin', 'Embryo', 'Smooth muscle', 'Eye',
      'Adrenal glands', 'Thyroid', 'Parathyroid glands', 'Urinary bladder',
    ],
  },
  celltypist: {
    label: 'Celltypist',
    tooltip: 'Runs Celltypist cell type annotation.',
    tissueOptions: [
      'Immune_All_Low.pkl',
      'Immune_All_High.pkl',
      'Adult_COVID19_PBMC.pkl',
      'Adult_CynomolgusMacaque_Hippocampus.pkl',
      'Adult_Human_MTG.pkl',
      'Adult_Human_PancreaticIslet.pkl',
      'Adult_Human_PrefrontalCortex.pkl',
      'Adult_Human_Skin.pkl',
      'Adult_Human_Vascular.pkl',
      'Adult_Mouse_Gut.pkl',
      'Adult_Mouse_OlfactoryBulb.pkl',
      'Adult_Pig_Hippocampus.pkl',
      'Adult_RhesusMacaque_Hippocampus.pkl',
      'Autopsy_COVID19_Lung.pkl',
      'COVID19_HumanChallenge_Blood.pkl',
      'COVID19_Immune_Landscape.pkl',
      'Cells_Adult_Breast.pkl',
      'Cells_Fetal_Lung.pkl',
      'Cells_Human_Tonsil.pkl',
      'Cells_Intestinal_Tract.pkl',
      'Cells_Lung_Airway.pkl',
      'Developing_Human_Brain.pkl',
      'Developing_Human_Gonads.pkl',
      'Developing_Human_Hippocampus.pkl',
      'Developing_Human_Organs.pkl',
      'Developing_Human_Thymus.pkl',
      'Developing_Mouse_Brain.pkl',
      'Developing_Mouse_Hippocampus.pkl',
      'Fetal_Human_AdrenalGlands.pkl',
      'Fetal_Human_Pancreas.pkl',
      'Fetal_Human_Pituitary.pkl',
      'Fetal_Human_Retina.pkl',
      'Fetal_Human_Skin.pkl',
      'Healthy_Adult_Heart.pkl',
      'Healthy_COVID19_PBMC.pkl',
      'Healthy_Human_Liver.pkl',
      'Healthy_Mouse_Liver.pkl',
      'Human_AdultAged_Hippocampus.pkl',
      'Human_Colorectal_Cancer.pkl',
      'Human_Developmental_Retina.pkl',
      'Human_Embryonic_YolkSac.pkl',
      'Human_Endometrium_Atlas.pkl',
      'Human_IPF_Lung.pkl',
      'Human_Longitudinal_Hippocampus.pkl',
      'Human_Lung_Atlas.pkl',
      'Human_PF_Lung.pkl',
      'Human_Placenta_Decidua.pkl',
      'Lethal_COVID19_Lung.pkl',
      'Mouse_Dentate_Gyrus.pkl',
      'Mouse_Isocortex_Hippocampus.pkl',
      'Mouse_Postnatal_DentateGyrus.pkl',
      'Mouse_Whole_Brain.pkl',
      'Nuclei_Lung_Airway.pkl',
      'Pan_Fetal_Human.pkl',
    ],

  },
};

const speciesOptions = [
  'human',
  'mouse',
];

const AnnotateClustersTool = ({ experimentId, onRunAnnotation }) => {
  const dispatch = useDispatch();

  const [selectedTool, setSelectedTool] = useState('sctype');
  const [tissue, setTissue] = useState(null);
  const [species, setSpecies] = useState(null);

  const cellSets = useSelector(getCellSets());

  const allClustersValid = useMemo(() => Object.entries(cellSets.properties).every(([, value]) => value.parentNodeKey !== 'louvain' || value.cellIds.size > 1), [cellSets]);

  const currentTool = annotationTools[selectedTool];

  return (
    <Space direction='vertical'>
      <Radio.Group
        value={selectedTool}
        onChange={(e) => setSelectedTool(e.target.value)}
      >
        {Object.entries(annotationTools).map(([key, tool]) => (
          <Tooltip title={tool.tooltip} key={key}>
            <Radio value={key}>{tool.label}</Radio>
          </Tooltip>
        ))}
      </Radio.Group>

      <Space direction='vertical' style={{ width: '100%' }}>
        Tissue Type:
        <Select
          options={currentTool.tissueOptions.map((option) => ({ label: option, value: option }))}
          value={tissue}
          placeholder='Select a tissue type'
          onChange={setTissue}
        />
      </Space>

      <Space direction='vertical' style={{ width: '100%' }}>
        Species:
        <Select
          options={speciesOptions.map((option) => ({ label: option, value: option }))}
          value={species}
          placeholder='Select a species'
          onChange={setSpecies}
        />
      </Space>
      {!allClustersValid
        && (
          <Alert
            message='There are some clusters with too few cells to compute annotations. Try increasing the clustering resolution value.'
            type='info'
            showIcon
          />
        )}
      <Button
        onClick={() => {
          dispatch(runCellSetsAnnotation(
            experimentId,
            species,
            tissue,
            `${annotationTools[selectedTool].label}Annotate`,
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

AnnotateClustersTool.defaultProps = {};

AnnotateClustersTool.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onRunAnnotation: PropTypes.func.isRequired,
};

export default AnnotateClustersTool;
