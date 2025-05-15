import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { Tooltip, Button } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';

import SubsetCellSetsModal from 'components/data-exploration/cell-sets-tool/SubsetCellSetsModal';
import { permissions, sampleTech } from 'utils/constants';
import PermissionsChecker from 'utils/PermissionsChecker';

const SubsetCellSetsOperation = (props) => {
  const { onCreate } = props;

  const sampleIds = useSelector((store) => store.experimentSettings.info.sampleIds);
  const experimentName = useSelector((store) => store.experimentSettings.info.experimentName);

  const samples = useSelector((store) => store.samples);
  const hasSeuratTechnology = sampleIds
    .some((sampleId) => samples[sampleId]?.type === sampleTech.SEURAT);

  const [showSubsetCellSets, setShowSubsetCellSets] = useState(false);

  return (
    <>
      <PermissionsChecker permissions={permissions.WRITE}>
        <Tooltip placement='top' title='Subset selected cell sets to a new project.'>
          <Button
            type='dashed'
            disabled={hasSeuratTechnology}
            aria-label='Create new experiment from selected cellsets'
            size='small'
            icon={<PieChartOutlined />}
            onClick={() => { setShowSubsetCellSets(true); }}
          />
        </Tooltip>
      </PermissionsChecker>

      {
        showSubsetCellSets && (
          <SubsetCellSetsModal
            experimentName={experimentName}
            onOk={(subsetName) => {
              onCreate(subsetName);
              setShowSubsetCellSets(false);
            }}
            onCancel={() => setShowSubsetCellSets(false)}
          />
        )
      }
    </>
  );
};

SubsetCellSetsOperation.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default SubsetCellSetsOperation;
