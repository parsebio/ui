/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
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
import { CheckCircleTwoTone, DeleteOutlined } from '@ant-design/icons';

import { uploadSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import PropTypes from 'prop-types';

const { Text } = Typography;
const SampleLTUpload = (props) => {
  const dispatch = useDispatch();
  const { secondaryAnalysisId, renderUploadedFileDetails } = props;
  const [file, setFile] = useState(false);
  const onDrop = async (droppedFile) => {
    setFile(droppedFile[0]);
  };
  const onUpload = async () => {
    dispatch(uploadSecondaryAnalysisFile(secondaryAnalysisId, file, 'samplelt'));
  };

  return (
    <>
      <Form
        layout='vertical'
        size='middle'
        style={{ width: '100%', margin: '0 auto' }}
        onFinish={(values) => console.log(values)}
      >
        <Form.Item
          label={(
            <div>
              Upload your sample loading table Excel file:
            </div>
          )}
          name='projectName'
        >
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
                style={{ border: '1px solid #ccc', padding: '2rem 0' }}
                {...getRootProps({ className: 'dropzone' })}
                id='dropzone'
              >
                <input data-test-id={integrationTestConstants.ids.FILE_UPLOAD_INPUT} {...getInputProps()} />
                <Empty description='Drag and drop xlsm file here or click to browse' image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
              onUpload();
              setFile(null);
            }}
          >
            Upload
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
SampleLTUpload.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
  renderUploadedFileDetails: PropTypes.func.isRequired,
};
export default SampleLTUpload;
