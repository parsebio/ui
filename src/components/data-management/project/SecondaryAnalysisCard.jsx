import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, Descriptions,
} from 'antd';
import { blue } from '@ant-design/colors';
import { useSelector, useDispatch } from 'react-redux';

import validateInputs, { rules } from 'utils/validateInputs';
import integrationTestConstants from 'utils/integrationTestConstants';
import EditableField from 'components/EditableField';
import PrettyTime from 'components/PrettyTime';
import { deleteSecondaryAnalysis, updateSecondaryAnalysis } from 'redux/actions/secondaryAnalyses';
import ProjectDeleteModal from 'components/data-management/project/ProjectDeleteModal';
import setActiveSecondaryAnalysis from 'redux/actions/secondaryAnalyses/setActiveSecondaryAnalysis';
import getFilesByType from 'redux/selectors/secondaryAnalyses/getFilesByType';

const { Item } = Descriptions;

const validationChecks = [
  rules.MIN_8_CHARS,
  rules.MIN_2_SEQUENTIAL_CHARS,
  rules.ALPHANUM_DASH_SPACE,
  rules.UNIQUE_NAME_CASE_INSENSITIVE,
];

const inactiveExperimentStyle = {
  cursor: 'pointer',
};

const activeExperimentStyle = {
  backgroundColor: blue[0],
  cursor: 'pointer',
  border: `2px solid ${blue.primary}`,
};

const itemTextStyle = { fontWeight: 'bold' };

const SecondaryAnalysisCard = (props) => {
  const { secondaryAnalysisId } = props;

  const dispatch = useDispatch();

  const secondaryAnalyses = useSelector((state) => state.secondaryAnalyses);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { activeSecondaryAnalysisId } = secondaryAnalyses.meta;
  const secondaryAnalysisCardStyle = activeSecondaryAnalysisId === secondaryAnalysisId
    ? activeExperimentStyle : inactiveExperimentStyle;
  const secondaryAnalysis = secondaryAnalyses[secondaryAnalysisId];

  const secondaryAnalysisNames = secondaryAnalyses.ids.map((id) => secondaryAnalyses[id].name);
  const secondaryAnalysisFiles = secondaryAnalysis.files.data;
  const fastQFilesNumber = Object.keys(getFilesByType(secondaryAnalysisFiles, 'fastq')).length;
  const validationParams = {
    existingNames: secondaryAnalysisNames,
  };

  const updateSecondaryAnalysisName = (newName) => {
    dispatch(updateSecondaryAnalysis(secondaryAnalysis.id, { name: newName.trim() }));
  };

  return (
    <>
      {deleteModalVisible && (
        <ProjectDeleteModal
          key={`${secondaryAnalysis.id}-name`}
          projectName={secondaryAnalysis.name}
          projectType='secondaryAnalyses'
          onCancel={() => { setDeleteModalVisible(false); }}
          onDelete={() => {
            dispatch(deleteSecondaryAnalysis(secondaryAnalysisId));
            setDeleteModalVisible(false);
          }}
        />
      )}
      <Card
        data-test-class={integrationTestConstants.classes.PROJECT_CARD}
        key={secondaryAnalysisId}
        type='primary'
        style={secondaryAnalysisCardStyle}
        onClick={() => {
          // set active secondary anlaysis
          dispatch(setActiveSecondaryAnalysis(secondaryAnalysisId));
        }}
      >
        <Descriptions
          layout='horizontal'
          size='small'
          column={1}
        >
          <Item contentStyle={{ fontWeight: 700, fontSize: 16 }}>
            <EditableField
              value={secondaryAnalysis.name}
              onAfterSubmit={updateSecondaryAnalysisName}
              onDelete={() => setDeleteModalVisible(true)}
              validationFunc={
                (newName) => validateInputs(
                  newName,
                  validationChecks,
                  validationParams,
                ).isValid
              }
            />
          </Item>
          <Item
            labelStyle={itemTextStyle}
            label='Fastq files'
          >
            {fastQFilesNumber || 0}
          </Item>
          <Item
            labelStyle={itemTextStyle}
            label='Created'
          >
            <PrettyTime isoTime={secondaryAnalysis.createdAt} />

          </Item>
          {/* <Item
            labelStyle={itemTextStyle}
            label='Modified'
          >
            <PrettyTime isoTime={secondaryAnalysis.updatedAt} />

          </Item> */}
        </Descriptions>
      </Card>
    </>
  );
};

SecondaryAnalysisCard.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
};

export default SecondaryAnalysisCard;
