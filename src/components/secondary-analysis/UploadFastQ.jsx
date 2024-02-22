/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Form, Empty,
} from 'antd';
import Dropzone from 'react-dropzone';
import integrationTestConstants from 'utils/integrationTestConstants';

const UploadFastQ = (props) => {
  const [form] = Form.useForm();

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
          Important information regarding indexes:
          FASTQ files from the same Parse experiment that have different Illumina indexes should not be concatenated. These files are separate sublibraries.
          FASTQ files from the same Parse experiment that share identical Illumina indexes must be concatenated. These files belong to the same sublibrary.
        </div>
        <Dropzone onDrop={(e) => console.log('DROPPED FILES ', e)} multiple>
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
      </Form.Item>
    </Form>
  );
};

export default UploadFastQ;
