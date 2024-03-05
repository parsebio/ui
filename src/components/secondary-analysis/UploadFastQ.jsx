import React, { useState, useEffect } from 'react';
import {
  Form, Empty, Divider, List, Space, Typography, Button,
} from 'antd';
import {
  CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import Dropzone from 'react-dropzone';
import integrationTestConstants from 'utils/integrationTestConstants';
import { createSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import _ from 'lodash';
import PropTypes from 'prop-types';
import uploadSecondaryAnalysisFile from 'utils/secondary-analysis/uploadSecondaryAnalysisFile';

import Expandable from 'components/Expandable';

const { Text } = Typography;

const UploadFastQ = (props) => {
  const { secondaryAnalysisId, renderFastqFileTable, setFilesNotUploaded } = props;
  const [filesList, setFilesList] = useState([]);
  const emptyFiles = { valid: [], invalid: [] };
  const [files, setFiles] = useState(emptyFiles);

  const dispatch = useDispatch();

  const beginUpload = async () => {
    // Save all files first and get uploadUrlParams for each
    const uploadUrlParamsList = await Promise.all(files.valid
      .map((file) => dispatch(createSecondaryAnalysisFile(secondaryAnalysisId, file, 'fastq'))));

    // upload files one by one using the corresponding uploadUrlParams
    await uploadUrlParamsList.reduce(async (promiseChain, uploadUrlParams, index) => {
    // Ensure the previous upload is completed
      await promiseChain;
      const file = files.valid[index];
      return uploadSecondaryAnalysisFile(file, secondaryAnalysisId, uploadUrlParams, dispatch);
    }, Promise.resolve()); // Start with an initially resolved promise
  };

  useEffect(() => {
    setFilesNotUploaded(Boolean(files.valid.length));
  }, [files]);

  const onDrop = (newFiles) => {
    const validFiles = newFiles
      .filter((file) => !file.name.startsWith('.') && !file.name.startsWith('__MACOSX'));

    let invalidFiles = _.difference(newFiles, validFiles)
      .map((file) => ({ path: file.path, rejectReason: 'Files starting with "." or "MACOSX" are hidden or system.' }));

    const validExtension = validFiles.filter((file) => file.name.endsWith('.fastq') || file.name.endsWith('.fastq.gz'));

    invalidFiles = [..._.difference(validFiles, validExtension)
      .map((file) => ({ path: file.path, rejectReason: 'Not a .fastq or .fastq.gz file.' })), ...invalidFiles];

    // Add definition of invalid
    setFiles({
      valid: [...files.valid, ...validExtension],
      invalid: [...files.invalid, ...invalidFiles],
    });
  };

  const removeFile = (fileName) => {
    const newArray = _.cloneDeep(files.valid);
    _.remove(newArray, (file) => file.name === fileName);
    setFiles({ valid: newArray, invalid: files.invalid });
  };
  return (
    <Form
      layout='vertical'
      size='middle'
      style={{ width: '100%', margin: '0 auto' }}
    >
      <Form.Item
        name='projectName'
      >
        <div>
          Upload your Fastq files that are output from bcl2fastq. For each sublibrary, you must have a pair of Fastq files, R1 and R2.
          <br />
          Note that:
          {' '}
          <br />
          <ul>
            <li>FASTQ files from the same Parse experiment that have different Illumina indexes should not be concatenated. These files are separate sublibraries.</li>
            <li>FASTQ files from the same Parse experiment that share identical Illumina indexes must be concatenated. These files belong to the same sublibrary.</li>
          </ul>
          Further details on Fastq file format can be found
          {' '}
          <a href='https://support.parsebiosciences.com/hc/en-us/articles/20926505533332-Fundamentals-of-Working-with-Parse-Data' target='_blank' rel='noreferrer'>here</a>

        </div>
        {files.invalid.length > 0 && (
          <div>
            <Expandable
              style={{ width: '100%' }}
              expandedContent={(
                <>
                  <Divider orientation='center' style={{ color: 'red', marginBottom: '0' }}>Ignored files</Divider>
                  <List
                    dataSource={files.invalid}
                    size='small'
                    itemLayout='horizontal'
                    pagination
                    renderItem={(file) => (
                      <List.Item key={file.path} style={{ height: '100%', width: '100%' }}>
                        <Space style={{ width: 200, justifyContent: 'center' }}>
                          <CloseCircleTwoTone twoToneColor='#f5222d' />
                          <div style={{ width: 200 }}>
                            <Text
                              ellipsis={{ tooltip: _.trim(file.path, '/') }}
                            >
                              {_.trim(file.path, '/')}
                            </Text>
                          </div>
                        </Space>
                        <Text style={{ width: '100%', marginLeft: '50px' }}>{file.rejectReason}</Text>
                      </List.Item>
                    )}
                  />
                </>
              )}
              collapsedContent={(
                <center style={{ cursor: 'pointer' }}>
                  <Divider orientation='center' style={{ color: 'red' }} />
                  <Text type='danger'>
                    {' '}
                    <WarningOutlined />
                    {' '}
                  </Text>
                  <Text>
                    {files.invalid.length}
                    {' '}
                    file
                    {files.invalid.length > 1 ? 's were' : ' was'}
                    {' '}
                    ignored, click to display
                  </Text>
                </center>
              )}
            />
            <br />
          </div>
        )}

        <Dropzone onDrop={onDrop} multiple>
          {({ getRootProps, getInputProps }) => (
            <div
              data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
              style={{ border: '1px solid #ccc', padding: '2rem 0' }}
              {...getRootProps({ className: 'dropzone' })}
              id='dropzone'
            >
              <input data-test-id={integrationTestConstants.ids.FILE_UPLOAD_INPUT} {...getInputProps()} webkitdirectory='' />
              <Empty description='Drag and drop folders here or click to browse' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </Dropzone>
        <Button
          data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
          type='primary'
          key='create'
          block
          disabled={!files.valid.length}
          onClick={() => {
            beginUpload(files.valid);
            setFiles(emptyFiles);
          }}
        >
          Upload
        </Button>
        {files.valid.length > 0 && (
          <>
            <Divider orientation='center'>To upload</Divider>
            <List
              dataSource={files.valid}
              size='small'
              itemLayout='horizontal'
              grid='{column: 4}'
              renderItem={(file) => (
                <List.Item
                  key={file.name}
                  style={{ width: '100%' }}
                >
                  <Space>
                    {!file.errors
                      ? (
                        <>
                          <CheckCircleTwoTone twoToneColor='#52c41a' />
                        </>
                      ) : (
                        <>
                          <CloseCircleTwoTone twoToneColor='#f5222d' />
                        </>
                      )}
                    <Text
                      style={{ width: '200px' }}
                    >
                      {file.name}
                    </Text>
                    <DeleteOutlined style={{ color: 'crimson' }} onClick={() => { removeFile(file.name); }} />
                  </Space>
                </List.Item>
              )}
            />
          </>
        )}
        <br />
        <br />
        {renderFastqFileTable()}
      </Form.Item>
    </Form>
  );
};
UploadFastQ.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
  renderFastqFileTable: PropTypes.func.isRequired,
  setFilesNotUploaded: PropTypes.func.isRequired,
};

export default UploadFastQ;
