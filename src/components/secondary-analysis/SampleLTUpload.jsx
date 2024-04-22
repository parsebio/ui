/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import {
  Form, Empty, Button,
  Typography,
  Space,
  Divider,
  List,
} from 'antd';
import { useDispatch } from 'react-redux';
import Dropzone from 'react-dropzone';
import integrationTestConstants from 'utils/integrationTestConstants';
import { CheckCircleTwoTone, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { deleteSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import PropTypes from 'prop-types';
import endUserMessages from 'utils/endUserMessages';
import { createAndUploadSecondaryAnalysisFiles } from 'utils/upload/processSecondaryUpload';

const { Text } = Typography;
const SampleLTUpload = (props) => {
  const dispatch = useDispatch();
  const {
    secondaryAnalysisId, renderUploadedFileDetails, uploadedFileId, setFilesNotUploaded,
  } = props;
  const [file, setFile] = useState(false);
  const [invalidInputWarnings, setInvalidInputWarnings] = useState([]);

  const onDrop = async (droppedFiles) => {
    const warnings = [];

    const validFiles = droppedFiles.filter((f) => f.name.endsWith('.xlsm'));

    if (validFiles.length === 0) {
      warnings.push(endUserMessages.ERROR_FAILED_SAMPLELT_FILE);
    }
    if (validFiles.length > 1) {
      warnings.push(endUserMessages.ERROR_MULTIPLE_SAMPLELT_FILES);
      validFiles.splice(1); // Keep only the first valid file
    }

    setInvalidInputWarnings(warnings);
    setFile(validFiles.length > 0 ? validFiles[0] : false);
  };

  useEffect(() => {
    setFilesNotUploaded(Boolean(file));
  }, [file]);

  const beginUpload = async () => {
    if (uploadedFileId) {
      dispatch(deleteSecondaryAnalysisFile(secondaryAnalysisId, uploadedFileId));
    }
    await createAndUploadSecondaryAnalysisFiles(secondaryAnalysisId, [file], [], 'samplelt', dispatch);
  };

  const uploadButtonText = uploadedFileId ? 'Replace' : 'Upload';

  return (
    <>
      <Form
        layout='vertical'
        size='middle'
        style={{ width: '100%', margin: '0 auto' }}
      >
        <Form.Item
          label={(
            <div>
              Upload your sample loading table Excel file:
            </div>
          )}
          name='projectName'
        >
          {(invalidInputWarnings.length > 0) && (
            <div>
              {invalidInputWarnings.map((warning) => (
                <center style={{ cursor: 'pointer' }}>
                  <Text type='danger'>
                    {' '}
                    <WarningOutlined />
                    {' '}
                  </Text>
                  <Text>
                    {' '}
                    {warning}
                    <br />
                  </Text>
                </center>
              ))}
              <br />
            </div>
          )}
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
                style={{ border: '1px solid #ccc', padding: '2rem 0' }}
                {...getRootProps({ className: 'dropzone' })}
                id='dropzone'
              >
                <input
                  data-test-id={integrationTestConstants.ids.FILE_UPLOAD_INPUT}
                  {...getInputProps()}
                />
                <Empty
                  description='Drag and drop xlsm file here or click to browse'
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </Dropzone>
          <Button
            data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
            type='primary'
            key='create'
            block
            disabled={!file}
            onClick={() => {
              beginUpload();
              setFile(null);
            }}
          >
            {uploadButtonText}
          </Button>
          {file && (
            <>
              <Divider orientation='center'>To upload</Divider>
              <List
                size='small'
                itemLayout='horizontal'
                grid='{column: 4}'
              >
                <List.Item
                  key={file.name}
                  style={{ width: '100%' }}
                >
                  <Space>
                    <CheckCircleTwoTone twoToneColor='#52c41a' />
                    <Text
                      ellipsis={{ tooltip: file.name }}
                      style={{ width: '200px' }}
                    >
                      {file.name}
                    </Text>
                    <DeleteOutlined style={{ color: 'crimson' }} onClick={() => { setFile(false); }} />
                  </Space>
                </List.Item>
              </List>
            </>
          )}
          {renderUploadedFileDetails()}
        </Form.Item>
      </Form>
    </>
  );
};
SampleLTUpload.defaultProps = {
  uploadedFileId: null,
};
SampleLTUpload.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
  renderUploadedFileDetails: PropTypes.func.isRequired,
  uploadedFileId: PropTypes.string,
  setFilesNotUploaded: PropTypes.func.isRequired,
};
export default SampleLTUpload;
