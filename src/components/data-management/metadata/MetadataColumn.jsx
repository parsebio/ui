import React from 'react';
import { Space, Input } from 'antd';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { renameMetadataTrack } from 'redux/actions/experiments';

import validateInputs, { rules } from 'utils/validateInputs';
import { metadataNameToKey } from 'utils/data-management/metadataUtils';
import { METADATA_DEFAULT_VALUE } from 'redux/reducers/experiments/initialState';
import EditableField from '../../EditableField';
import MetadataEditor from './MetadataEditor';

const MetadataColumnTitle = (props) => {
  const {
    name, sampleNames, activeExperimentId, deleteMetadataColumn, setCells, samplesList,
  } = props;

  const validationParams = {
    existingNames: sampleNames,
  };

  return (
    <MetadataTitle
      name={name}
      validateInput={
        (newName, metadataNameValidation) => validateInputs(
          newName,
          metadataNameValidation,
          validationParams,
        ).isValid
      }
      setCells={setCells}
      deleteMetadataColumn={deleteMetadataColumn}
      activeExperimentId={activeExperimentId}
      samplesList={samplesList}
    />
  );
};

MetadataColumnTitle.propTypes = {
  name: PropTypes.string.isRequired,
  sampleNames: PropTypes.instanceOf(Set).isRequired,
  setCells: PropTypes.func.isRequired,
  deleteMetadataColumn: PropTypes.func.isRequired,
  activeExperimentId: PropTypes.string.isRequired,
  samplesList: PropTypes.arrayOf(PropTypes.shape({
    sampleUuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

const MetadataTitle = (props) => {
  const dispatch = useDispatch();
  const {
    name, validateInput, setCells, deleteMetadataColumn, activeExperimentId, samplesList,
  } = props;
  const metaKey = metadataNameToKey(name);

  const metadataNameValidation = [
    rules.MIN_1_CHAR,
    rules.ALPHANUM_SPACE,
    rules.START_WITH_ALPHABET,
    rules.UNIQUE_NAME_CASE_INSENSITIVE,
  ];
  return (
    <Space>
      <EditableField
        deleteEnabled
        onDelete={(e, currentName) => deleteMetadataColumn(currentName)}
        onAfterSubmit={(newName) => dispatch(
          renameMetadataTrack(name, newName, activeExperimentId),
        )}
        value={name}
        validationFunc={
          (newName) => validateInput(newName, metadataNameValidation)
        }
        formatter={(value) => value.trim()}
      />
      <MetadataEditor
        onReplaceEmpty={(value, selectedSamples) => setCells(value, metaKey, 'REPLACE_EMPTY', selectedSamples)}
        onReplaceAll={(value, selectedSamples) => setCells(value, metaKey, 'REPLACE_ALL', selectedSamples)}
        onClearAll={(selectedSamples) => setCells(METADATA_DEFAULT_VALUE, metaKey, 'CLEAR_ALL', selectedSamples)}
        massEdit
        samplesList={samplesList}
      >
        <Input />
      </MetadataEditor>
    </Space>
  );
};
MetadataTitle.propTypes = {
  name: PropTypes.string.isRequired,
  validateInput: PropTypes.func.isRequired,
  setCells: PropTypes.func.isRequired,
  deleteMetadataColumn: PropTypes.func.isRequired,
  activeExperimentId: PropTypes.string.isRequired,
  samplesList: PropTypes.arrayOf(PropTypes.shape({
    sampleUuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};
export default MetadataColumnTitle;
