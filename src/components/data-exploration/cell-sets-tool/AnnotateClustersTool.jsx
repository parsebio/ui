import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Radio, Space, Tooltip,
} from 'antd';

import CellTypistAnnotate from './AnnotateClusters/CellTypistAnnotate';
import ScTypeAndDecouplerAnnotate from './AnnotateClusters/ScTypeAndDecouplerAnnotate';

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
  },
  decoupler: {
    label: 'Decoupler',
    tooltip: DecouplerTooltipText,
  },
  celltypist: {
    label: 'CellTypist',
    // TODO fill in tooltip
    tooltip: 'Runs CellTypist cell type annotation.',
  },
};

const AnnotateClustersTool = ({ experimentId, onRunAnnotation }) => {
  const [selectedTool, setSelectedTool] = useState('sctype');

  return (
    <Space direction='vertical'>
      <Radio.Group
        value={selectedTool}
        onChange={(e) => {
          setSelectedTool(e.target.value);
        }}
      >
        {Object.entries(annotationTools).map(([key, tool]) => (
          <Tooltip title={tool.tooltip} key={key} placement='left' mouseEnterDelay={0.5}>
            <Radio value={key}>{tool.label}</Radio>
          </Tooltip>
        ))}
      </Radio.Group>

      {selectedTool === 'celltypist' ? (
        <CellTypistAnnotate
          experimentId={experimentId}
          onRunAnnotation={onRunAnnotation}
        />
      ) : (
        <ScTypeAndDecouplerAnnotate
          experimentId={experimentId}
          onRunAnnotation={onRunAnnotation}
          selectedTool={selectedTool}
        />
      )}

    </Space>
  );
};

AnnotateClustersTool.defaultProps = {};

AnnotateClustersTool.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onRunAnnotation: PropTypes.func.isRequired,
};

export default AnnotateClustersTool;
