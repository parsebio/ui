import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Button, Input, Space, Typography, Form, Alert,
} from 'antd';
import integrationTestConstants from 'utils/integrationTestConstants';

const { Text, Paragraph } = Typography;

const ProjectDeleteModal = (props) => {
  const {
    projectName, onCancel, onDelete, projectType,
  } = props;

  const [inputProjectName, setinputProjectName] = useState('');
  const [isValid, setIsValid] = useState(false);

  const projectTypeInfo = {
    secondaryAnalyses: {
      shownName: 'run',
      associatedFilesInfoText: 'fastq files',
    },
    experiments: {
      shownName: 'project',
      associatedFilesInfoText: 'data sets, metadata, analyses',
    },
  };

  const { shownName, associatedFilesInfoText } = projectTypeInfo[projectType];

  return (
    <Modal
      className={integrationTestConstants.classes.DELETE_PROJECT_MODAL}
      title='Confirm delete'
      open
      footer={(
        <Space>
          <Button
            type='secondary'
            key='cancel'
            onClick={() => {
              onCancel();
              setIsValid(false);
            }}
          >
            Keep
            {' '}
            {shownName}
          </Button>

          <Button
            type='danger'
            key='create'
            disabled={!isValid}
            onClick={() => {
              onDelete();
            }}
          >
            Permanently delete
            {' '}
            {shownName}
          </Button>
        </Space>
      )}
      onCancel={onCancel}
    >
      <Space>
        <Space direction='vertical'>
          <Paragraph>
            Are you
            {' '}
            <Text strong>absolutely</Text>
            {' '}
            sure?
          </Paragraph>
          <Paragraph>
            {' '}
            This will delete the
            {' '}
            {shownName}
            {' '}
            <Text strong>{projectName}</Text>
            {', '}
            all of its
            {' '}
            {associatedFilesInfoText}
            , and all other information
            under this
            {' '}
            {shownName}
            .
          </Paragraph>

          <Paragraph>
            <Alert
              message='This action cannot be undone. Make sure you understand its effects before continuing.'
              type='warning'
              showIcon
            />
          </Paragraph>

          <Form layout='vertical'>
            <Form.Item
              label={`Type in the name of the ${shownName} to confirm:`}
            >
              <Input
                data-test-id={integrationTestConstants.classes.DELETE_PROJECT_MODAL_INPUT}
                onChange={(e) => {
                  setIsValid(projectName === e.target.value);
                  setinputProjectName(e.target.value);
                }}
                placeholder={projectName}
                value={inputProjectName}
              />
            </Form.Item>
          </Form>

        </Space>
      </Space>
    </Modal>

  );
};

ProjectDeleteModal.propTypes = {
  projectName: PropTypes.string.isRequired,
  projectType: PropTypes.oneOf(['secondaryAnalyses', 'experiment']).isRequired,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
};

ProjectDeleteModal.defaultProps = {
  onCancel: () => null,
  onDelete: () => null,
};

export default ProjectDeleteModal;
