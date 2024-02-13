/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Form, Select,
} from 'antd';

const { Option } = Select;
const SelectReferenceGenome = () => {
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
              Select the reference genome:
            </div>
          )}
          name='projectName'
        >
          <Select style={{ marginLeft: '10px', width: '90%' }} placeholder='Select the reference genome'>
            <Option value='sublibrary1'>Human</Option>
            <Option value='sublibrary2'>Mouse</Option>
          </Select>
        </Form.Item>
      </Form>
    </>
  );
};

export default SelectReferenceGenome;
