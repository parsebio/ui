import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Radio, Space, Tooltip,
} from 'antd';

import ScanpyDisabler from 'utils/ScanpyDisabler';
import SeuratDisabler from 'utils/SeuratDisabler';
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

const CellTypistTooltipText = (
  <>
    Uses CellTypist, an automated scRNA-seq annotation tool based on regularised
    logistic regression classifiers. More details can be found in the
    {' '}
    <a target='_blank' href='https://www.celltypist.org' rel='noreferrer'>
      CellTypist website
    </a>
    .
    <br />
    <br />
    References:
    Automatic cell-type harmonization and integration across Human Cell Atlas
    datasets. Cell 186, 5876-5891.e20 (2023).
    {' '}
    <a target='_blank' href='https://doi.org/10.1016/j.cell.2023.11.026' rel='noreferrer'>
      https://doi.org/10.1016/j.cell.2023.11.026
    </a>
    ;
    <br />
    Cross-tissue immune cell analysis reveals tissue-specific features in humans.
    Science 376, eabl5197 (2022).
    {' '}
    <a target='_blank' href='https://doi.org/10.1126/science.abl5197' rel='noreferrer'>
      https://doi.org/10.1126/science.abl5197
    </a>
    .
  </>
);

const annotationTools = {
  sctype: {
    label: 'ScType',
    tooltip: ScTypeTooltipText,
    DisablerToUse: ScanpyDisabler,
  },
  decoupler: {
    label: 'Decoupler',
    tooltip: DecouplerTooltipText,
    DisablerToUse: SeuratDisabler,
  },
  celltypist: {
    label: 'CellTypist',
    tooltip: CellTypistTooltipText,
    DisablerToUse: SeuratDisabler,
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
        style={{ display: 'flex', flexDirection: 'row' }}
      >
        {Object.entries(annotationTools).map(([key, tool]) => {
          const { DisablerToUse } = tool;
          const radio = (
            <Tooltip title={tool.tooltip} key={key} placement='left' mouseEnterDelay={0.5}>
              <Radio value={key}>{tool.label}</Radio>
            </Tooltip>
          );
          return DisablerToUse ? (
            <DisablerToUse experimentId={experimentId} key={key}>
              {radio}
            </DisablerToUse>
          ) : radio;
        })}
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
