import React, { useState, useEffect } from 'react';
import {
  Form, Empty, Divider, List, Space, Typography, Button,
} from 'antd';
import {
  CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import integrationTestConstants from 'utils/integrationTestConstants';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { createAndUploadSecondaryAnalysisFiles } from 'utils/upload/processSecondaryUpload';

import Expandable from 'components/Expandable';
import endUserMessages from 'utils/endUserMessages';

const { Text } = Typography;

const UploadFastQ = (props) => {
  const {
    secondaryAnalysisId, renderFastqFileTable, setFilesNotUploaded, secondaryAnalysisFiles,
  } = props;
  const emptyFiles = { valid: [], invalid: [] };
  const [fileHandles, setFileHandles] = useState(emptyFiles);

  const dispatch = useDispatch();

  const beginUpload = async () => {
    const filesList = await Promise.all(fileHandles.valid.map(async (handle) => handle.getFile()));
    await createAndUploadSecondaryAnalysisFiles(secondaryAnalysisId, filesList, fileHandles.valid, 'fastq', dispatch);
  };

  useEffect(() => {
    setFilesNotUploaded(Boolean(fileHandles.valid.length));
  }, [fileHandles]);

  const validateAndSetFiles = async (fileHandlesList) => {
    const alreadyUploadedFiles = Object.values(secondaryAnalysisFiles).map((item) => item.name);

    const validators = [
      { validate: (file) => !file.name.startsWith('.') && !file.name.startsWith('__MACOSX'), rejectReason: endUserMessages.ERROR_HIDDEN_FILE },
      { validate: (file) => file.name.endsWith('.fastq') || file.name.endsWith('.fastq.gz'), rejectReason: endUserMessages.ERROR_NOT_FASTQ },
      { validate: (file) => !alreadyUploadedFiles.includes(file.name), rejectReason: endUserMessages.ERROR_ALREADY_UPLOADED },
    ];

    const invalidFiles = [];
    const validFiles = fileHandlesList.filter((newFile) => {
      const rejectedValidator = validators.find((validator) => !validator.validate(newFile));
      if (rejectedValidator) {
        invalidFiles.push({ rejectReason: rejectedValidator.rejectReason, name: newFile.name });
        return false;
      }
      return true;
    });

    setFileHandles((prevState) => ({
      valid: _.uniqBy([...prevState.valid, ...validFiles], 'name'),
      invalid: _.uniqBy([...prevState.invalid, ...invalidFiles], 'name'),
    }));
  };

  const handleFileSelection = async () => {
    try {
      const opts = { multiple: true };
      const handles = await window.showOpenFilePicker(opts);
      return validateAndSetFiles(handles);
    } catch (err) {
      console.error('Error picking files:', err);
    }
  };
  // we save the file handles to the cache
  // The dropzone component couldn't be used as it doesn't support file handle
  const getAllFiles = async (entry) => {
    const subFiles = [];
    if (entry.kind === 'file') {
      subFiles.push(entry);
    } else if (entry.kind === 'directory') {
      for await (const currEntry of entry.values()) {
        const nestedFiles = await getAllFiles(currEntry);
        subFiles.push(...nestedFiles);
      }
    }
    return subFiles;
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const { items } = e.dataTransfer;
    const newFiles = await Promise.all(Array.from(items).map(async (item) => {
      const entry = await item.getAsFileSystemHandle();
      const subFiles = await getAllFiles(entry);
      return subFiles;
    }));
    return validateAndSetFiles(newFiles.flat());
  };

  useEffect(() => {
    const dropzone = document.getElementById('dropzone');
    dropzone.addEventListener('drop', onDrop);
    return () => dropzone.removeEventListener('drop', onDrop);
  }, []);

  const removeFile = (fileName) => {
    setFileHandles((prevState) => {
      const newValid = _.filter(prevState.valid, (file) => file.name !== fileName);

      return {
        valid: newValid,
        invalid: fileHandles.invalid,
      };
    });
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
        {fileHandles.invalid.length > 0 && (
          <div>
            <Expandable
              style={{ width: '100%' }}
              expandedContent={(
                <>
                  <Divider orientation='center' style={{ color: 'red', marginBottom: '0' }}>Ignored files</Divider>
                  <List
                    dataSource={fileHandles.invalid}
                    size='small'
                    itemLayout='horizontal'
                    pagination
                    renderItem={(file) => (
                      <List.Item key={file.name} style={{ height: '100%', width: '100%' }}>
                        <Space style={{ width: 200, justifyContent: 'center' }}>
                          <CloseCircleTwoTone twoToneColor='#f5222d' />
                          <div style={{ width: 200 }}>
                            <Text
                              ellipsis={{ tooltip: file.name }}
                            >
                              {file.name}
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
                    {fileHandles.invalid.length}
                    {' '}
                    file
                    {fileHandles.invalid.length > 1 ? 's were' : ' was'}
                    {' '}
                    ignored, click to display
                  </Text>
                </center>
              )}
            />
            <br />
          </div>
        )}

        <div
          onClick={handleFileSelection}
          onKeyDown={handleFileSelection}
          data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
          style={{ border: '1px solid #ccc', padding: '2rem 0' }}
          className='dropzone'
          id='dropzone'
        >
          <Empty description='Drag and drop files here or click to browse' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
        <Button
          data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
          type='primary'
          key='create'
          block
          disabled={!fileHandles.valid.length}
          onClick={() => {
            beginUpload(fileHandles.valid);
            setFileHandles(emptyFiles);
          }}
        >
          Upload
        </Button>
        {fileHandles.valid.length > 0 && (
          <>
            <Divider orientation='center'>To upload</Divider>
            <List
              dataSource={fileHandles.valid}
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
  secondaryAnalysisFiles: PropTypes.object.isRequired,
};

export default UploadFastQ;
