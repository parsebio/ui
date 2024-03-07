import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const NewProjectModal = ({ projectType, onCreate, onCancel }) => {
  const projectData = useSelector((state) => state[projectType]);
  const { saving, error } = projectData.meta;
  const isSecondaryAnalysis = projectType === 'secondaryAnalyses';
  const [projectNames, setProjectNames] = useState(new Set());
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isValidName, setIsValidName] = useState(false);
  const displayedProjectType = isSecondaryAnalysis ? 'Run' : 'Project';

  const firstTimeFlow = projectData.ids.length === 0 && !isSecondaryAnalysis;
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
    setProjectNames(new Set(projectData.ids.map((id) => projectData[id].name.trim())));
  }, [projectData.ids]);

  useEffect(() => {
    setIsValidName(validateInputs(projectName, validationChecks, validationParams).isValid);
  }, [projectName, projectNames]);

  const submit = async () => {
    setProjectName('');
    await onCreate(projectName, projectDescription);
  };

  return (
    <Modal
      className={integrationTestConstants.classes.NEW_PROJECT_MODAL}
      title={`Create a new ${isSecondaryAnalysis ? 'run' : 'project'}`}
      open
      footer={(
        <Button
          data-test-id={integrationTestConstants.ids.CONFIRM_CREATE_NEW_PROJECT}
          type='primary'
          key='create'
          block
          disabled={!isValidName}
          onClick={async () => await submit()}
        >
          {`Create ${displayedProjectType}`}
        </Button>
      )}
      onCancel={onCancel}
    >
      <Space direction='vertical' style={{ width: '100%' }}>
        {firstTimeFlow && (
          <Title level={3} style={{ textAlign: 'center' }}>
            Create a project to start analyzing your data in Cellenics
          </Title>
        )}
        {!isSecondaryAnalysis && (
          <Paragraph>
            Projects are where you can organize your data into
            samples, assign metadata, and start your analysis
            in Cellenics. Name it after the experiment
            you&apos;re working on.
          </Paragraph>
        )}
        <Form layout='vertical'>
          <Form.Item
            validateStatus={(isValidName || projectName.length === 0) ? 'success' : 'error'}
            help={projectName && (
              <ul>
                {validateInputs(
                  projectName,
                  validationChecks,
                  validationParams,
                ).results
                  .filter((msg) => msg !== true)
                  .map((msg) => <li key={msg}>{msg}</li>)}
              </ul>
            )}
            label={(
              <span>
                {`${displayedProjectType} name `}
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

          <Form.Item
            label={`${displayedProjectType} description`}
          >
            <TextArea
              data-test-id={integrationTestConstants.ids.PROJECT_DESCRIPTION}
              onChange={(e) => { setProjectDescription(e.target.value); }}
              placeholder='Type description'
              autoSize={{ minRows: 3, maxRows: 5 }}
              disabled={saving}
              aria-label='new project description'
              value={projectDescription}
            />
          </Form.Item>
        </Form>

        {saving && (
          <center>
            <Space direction='vertical'>
              <ClipLoader size={50} color='#8f0b10' />
              <Text>
                Creating
                {' '}
                {displayedProjectType}
                ...
              </Text>
            </Space>
          </center>
        )}

        {error && (
          <Text type='danger' style={{ fontSize: 14 }}>
            {error}
          </Text>
        )}
      </Space>
    </Modal>
  );
};

NewProjectModal.propTypes = {
  projectType: PropTypes.oneOf(['secondaryAnalyses', 'experiments']).isRequired,
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default NewProjectModal;
