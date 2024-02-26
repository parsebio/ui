import React, { useState } from 'react';
import {
  Form, Empty, Divider, List, Space, Typography, Button,
} from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import Dropzone from 'react-dropzone';
import integrationTestConstants from 'utils/integrationTestConstants';
import { uploadSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import _ from 'lodash';
import PropTypes from 'prop-types';

const { Text } = Typography;

const UploadFastQ = (props) => {
  const { secondaryAnalysisId, renderFastqFileTable } = props;
  const [form] = Form.useForm();
  const [filesList, setFilesList] = useState([]);
  const dispatch = useDispatch();
  const onUpload = async () => {
    const promises = [];
    filesList.forEach((file) => {
      promises.push(async () => await dispatch(
        uploadSecondaryAnalysisFile(secondaryAnalysisId, file, 'fastq'),
      ));
    });
    // 5 at a time
    const chunkedPromises = _.chunk(promises, promises.length);

    // eslint-disable-next-line no-restricted-syntax
    for await (const promisesChunk of chunkedPromises) {
      await Promise.all(promisesChunk.map((promise) => promise()));
    }
  };

  const onDrop = (files) => {
    setFilesList(files);
  };

  const removeFile = (fileName) => {
    const newArray = _.cloneDeep(filesList);

    const fileIdx = newArray.findIndex((file) => file.name === fileName);
    newArray.splice(fileIdx, 1);
    setFilesList(newArray);
  };
  return (
    <Form
      form={form}
      layout='vertical'
      size='middle'
      style={{ width: '100%', margin: '0 auto' }}
      onFinish={(values) => console.log(values)}
    >
      <Form.Item
        name='projectName'
      >
        <div>
          Upload your Fastq files that are output from bcl2fastq. For each sublibrary, you must have a pair of Fastq files, R1 and R2.
          The R2 read lengths must be 86bp or greater. Any read in R2 that is less than 86bp long will be discarded by the pipeline.
          Further details on Fastq file format can be found
          {' '}
          <a href='https://support.parsebiosciences.com/hc/en-us/articles/20926505533332-Fundamentals-of-Working-with-Parse-Data' target='_blank' rel='noreferrer'>here</a>
          .
          <br />
          <br />
          Important information regarding indexes:
          <br />
          <ul>
            <li>FASTQ files from the same Parse experiment that have different Illumina indexes should not be concatenated. These files are separate sublibraries.</li>
            <li>FASTQ files from the same Parse experiment that share identical Illumina indexes must be concatenated. These files belong to the same sublibrary.</li>
          </ul>
        </div>
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
          disabled={!filesList.length}
          onClick={() => {
            onUpload(filesList);
            setFilesList([]);
          }}
        >
          Upload
        </Button>
        {filesList.length ? (
          <>
            <Divider orientation='center'>To upload</Divider>
            <List
              dataSource={filesList}
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
        ) : ''}
        {renderFastqFileTable()}
      </Form.Item>
    </Form>
  );
};
UploadFastQ.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
  renderFastqFileTable: PropTypes.func.isRequired,
};

export default UploadFastQ;
