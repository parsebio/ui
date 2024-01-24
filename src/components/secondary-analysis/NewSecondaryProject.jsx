import React from 'react';
import {
  Select, Form, Input, Typography,
} from 'antd';
import propTypes from 'prop-types';

const { Title } = Typography;
const { Option } = Select;
const NewSecondaryProject = (props) => {
  const [form] = Form.useForm();

  // const handleOk = () => {
  //   form
  //     .validateFields()
  //     .then((values) => {
  //       console.log('Received values of form: ', values);
  //     })
  //     .catch((info) => {
  //       console.log('Validate Failed:', info);
  //     });
  // };
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
              <span style={{ color: 'red' }}>*</span>
              Project name:
            </div>
          )}
          name='projectName'
          // rules={[{ required: true, message: 'Please input the project name!' }]}
        >
          <Input style={{ width: '70%' }} placeholder='Ex.: Mouse lymph node dataset' />
        </Form.Item>
        <Form.Item
          label='Parse Biosciences technology details:           '
          name='technologyDetails'
          // rules={[{ required: true, message: 'Please select a technology detail!' }]}
        >
          <Select placeholder='Select the kit you used in your experiment ' style={{ width: '70%' }}>
            <Option value='option1'>Option 1</Option>
            <Option value='option2'>Option 2</Option>
          </Select>
        </Form.Item>

        <Title level={5}>Provide details of your experimental design</Title>
        <Form.Item
          name='numberOfSamples'
          style={{ marginLeft: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              Select the number of samples:
            </div>
            <Select style={{ marginLeft: '10px', width: '20%' }}>
              <Option value='sample1'>Sample 1</Option>
              <Option value='sample2'>Sample 2</Option>
            </Select>
          </div>
        </Form.Item>
        <Form.Item
          name='numberOfSublibraries'
          style={{ marginLeft: '20px' }}
          // rules={[{ required: true, message: 'Please select the number of sublibraries!' }]}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              Select the number of
              {' '}
              <a
                href='https://support.parsebiosciences.com/hc/en-us/articles/360052394312-What-is-a-sublibrary-'
                target='_blank'
                rel='noreferrer'
              >
                sublibraries
              </a>
              :
            </div>
            <Select style={{ marginLeft: '10px', width: '20%' }}>
              <Option value='sublibrary1'>Sublibrary 1</Option>
              <Option value='sublibrary2'>Sublibrary 2</Option>
            </Select>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

NewSecondaryProject.propTypes = {
  onCancel: propTypes.func.isRequired,
  onNext: propTypes.func.isRequired,
};
export default NewSecondaryProject;
