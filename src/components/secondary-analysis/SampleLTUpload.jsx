/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Form, Empty,
} from 'antd';
import Dropzone from 'react-dropzone';
import integrationTestConstants from 'utils/integrationTestConstants';

const SampleLTUpload = () => {
  const [form] = Form.useForm();

  return (
    <>
      <Form
        form={form}
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
          <Dropzone onDrop={(e) => console.log('DROPPED FILES ', e)} multiple>
            {({ getRootProps, getInputProps }) => (
              <div
                // data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
                style={{ border: '1px solid #ccc', padding: '2rem 0' }}
                {...getRootProps({ className: 'dropzone' })}
                id='dropzone'
              >
                <input data-test-id={integrationTestConstants.ids.FILE_UPLOAD_INPUT} {...getInputProps()} webkitdirectory='' />
                <Empty description='drag and drop xlsm file here or click to browse' image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </Dropzone>
        </Form.Item>
      </Form>
    </>
  );
};

export default SampleLTUpload;
