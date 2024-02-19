import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Typography,
} from 'antd';

import validateInputs, { rules } from 'utils/validateInputs';
import integrationTestConstants from 'utils/integrationTestConstants';
import createSecondaryAnalysis from 'redux/actions/secondaryAnalyses/createSecondaryAnalysis';

const { Text } = Typography;

const NewSecondaryAnalysisModal = (props) => {
  const {
    onCreate,
    onCancel,
  } = props;

  const secondaryAnalyses = useSelector(((state) => state.secondaryAnalyses));
  const { saving, error } = secondaryAnalyses.meta;

  const dispatch = useDispatch();
  const [projectNames, setProjectNames] = useState(new Set());
  const [projectName, setProjectName] = useState('');
  const [isValidName, setIsValidName] = useState(false);

  const validationChecks = [
    rules.MIN_8_CHARS,
    rules.MIN_2_SEQUENTIAL_CHARS,
    rules.ALPHANUM_DASH_SPACE,
    rules.UNIQUE_NAME_CASE_INSENSITIVE,
  ];

  const validationParams = {
    existingNames: projectNames,
  };

  useEffect(() => {
    setProjectNames(new Set(secondaryAnalyses.ids.map((id) => secondaryAnalyses[id].name.trim())));
  }, [secondaryAnalyses.ids]);

  useEffect(() => {
    setIsValidName(validateInputs(projectName, validationChecks, validationParams).isValid);
  }, [projectName, projectNames]);

  const submit = async () => {
    setProjectName('');

    await dispatch(createSecondaryAnalysis(projectName));
    onCreate(projectName);
  };

  return (
    <Modal
      className={integrationTestConstants.classes.NEW_PROJECT_MODAL}
      title='Create a new run'
      open
      footer={(
        <Button
          data-test-id={integrationTestConstants.ids.CONFIRM_CREATE_NEW_PROJECT}
          type='primary'
          key='create'
          block
          disabled={!isValidName}
          onClick={async () => {
            await submit();
          }}
        >
          Create Run
        </Button>
      )}
      onCancel={onCancel}
    >
      <Space direction='vertical' style={{ width: '100%' }}>
        <Form layout='vertical'>
          <Form.Item
            validateStatus={isValidName ? 'success' : 'error'}
            help={(
              <ul>
                {validateInputs(
                  projectName,
                  validationChecks,
                  validationParams,
                ).results
                  .filter((msg) => msg !== true)
                  .map((msg) => <li>{msg}</li>)}
              </ul>
            )}
            label={(
              <span>
                Run name
                {' '}
                <Text type='secondary'>(You can change this later)</Text>
              </span>
            )}
            required
            name='requiredMark'
          >
            <Input
              data-test-id={integrationTestConstants.ids.PROJECT_NAME}
              aria-label='new project name'
              onChange={(e) => {
                setProjectName(e.target.value.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValidName) {
                  submit();
                }
              }}
              placeholder='Ex.: Lung gamma delta T cells'
              value={projectName}
              disabled={saving}
            />
          </Form.Item>
        </Form>

        {
          saving && (
            <center>
              <Space direction='vertical'>
                <ClipLoader
                  size={50}
                  color='#8f0b10'
                />
                <Text>Creating run...</Text>
              </Space>
            </center>
          )
        }

        {
          error && (
            <Text type='danger' style={{ fontSize: 14 }}>
              {error}
            </Text>
          )
        }

      </Space>
    </Modal>

  );
};

NewSecondaryAnalysisModal.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default NewSecondaryAnalysisModal;
