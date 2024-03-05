import React, { useState, useEffect } from 'react';
import {
  Form, Empty, Divider, List, Space, Typography, Button,
} from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import integrationTestConstants from 'utils/integrationTestConstants';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { createAndUploadSecondaryAnalysisFiles } from 'utils/upload/processSecondaryUpload';

const { Text } = Typography;

const UploadFastQ = (props) => {
  const { secondaryAnalysisId, renderFastqFileTable, setFilesNotUploaded } = props;
  const [fileHandlesList, setFileHandlesList] = useState([]);
  const dispatch = useDispatch();

  const beginUpload = async () => {
    const filesList = await Promise.all(fileHandlesList.map(async (handle) => handle.getFile()));
    await createAndUploadSecondaryAnalysisFiles(secondaryAnalysisId, filesList, fileHandlesList, 'fastq', dispatch);
  };

  useEffect(() => {
    setFilesNotUploaded(Boolean(fileHandlesList.length));
  }, [fileHandlesList]);
  const getAllFilesFromDirectory = async (directoryHandle) => {
    const files = [];
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === 'file') {
        files.push(entry);
      } else if (entry.kind === 'directory') {
        const nestedFiles = await getAllFilesFromDirectory(entry);
        files.push(...nestedFiles);
      }
    }
    return files;
  };

  const handleFileSelection = async () => {
    try {
      const opts = { multiple: true };
      const handles = await window.showOpenFilePicker(opts);
      setFileHandlesList(handles);
    } catch (err) {
      console.error('Error picking files:', err);
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const { items } = e.dataTransfer;
    const files = await Promise.all(Array.from(items).map(async (item) => {
      const entry = await item.getAsFileSystemHandle();
      if (entry.kind === 'file') {
        return entry;
      } if (entry.kind === 'directory') {
        const subFiles = await getAllFilesFromDirectory(entry);
        return subFiles;
      }
    }));
    setFileHandlesList(files.flat());
  };

  useEffect(() => {
    const dropzone = document.getElementById('dropzone');
    dropzone.addEventListener('drop', onDrop);
    return () => dropzone.removeEventListener('drop', onDrop);
  }, []);

  const removeFile = (fileName) => {
    const newArray = _.cloneDeep(fileHandlesList);
    _.remove(newArray, (file) => file.name === fileName);
    setFileHandlesList(newArray);
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
          disabled={!fileHandlesList.length}
          onClick={() => {
            beginUpload(fileHandlesList);
            setFileHandlesList([]);
          }}
        >
          Upload
        </Button>
        {fileHandlesList.length > 0 && (
          <>
            <Divider orientation='center'>To upload</Divider>
            <List
              dataSource={fileHandlesList}
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
