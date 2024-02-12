import React, { useState } from 'react';
import {
  Select, Form, Input, Typography,
} from 'antd';
import propTypes from 'prop-types';

const { Title } = Typography;
const { Option } = Select;

const NewSecondaryProject = (props) => {
  const [form] = Form.useForm();
  const [selectedKit, setSelectedKit] = useState();
  const [maxSublibraries, setMaxSublibraries] = useState();

  const [numberOfSublibraries, setNumberOfSublibraries] = useState();
  const [numberOfSamples, setNumberOfSamples] = useState();

  const generateOptions = (end) => Array.from({ length: end }, (_, i) => i + 1).map((value) => (
    <Option key={value} value={`option${value}`}>{`${value}`}</Option>
  ));
  const changeKit = (kit) => {
    let newMaxSublibraries;
    switch (kit) {
      case 'wt_mini':
        newMaxSublibraries = 2;
        break;
      case 'wt':
        newMaxSublibraries = 8;
        break;
      case 'wt_mega':
        newMaxSublibraries = 16;
        break;
      default:
        console.log('INVALID OPTION SELECTED ');
    }
    setMaxSublibraries(newMaxSublibraries);
    setNumberOfSamples(newMaxSublibraries * 6);
    setNumberOfSublibraries(newMaxSublibraries);
    setSelectedKit(kit);
  };

  return (
    <>
      <Form
        form={form}
        layout='vertical'
        size='middle'
        style={{ width: '100%', margin: '0 auto', height: '50%' }}
        onFinish={(values) => console.log(values)}
      >
        <Form.Item
          label='Project name:'
          name='projectName'
        >
          <Input style={{ width: '70%' }} placeholder='Ex.: Mouse lymph node dataset' />
        </Form.Item>
        <Form.Item
          label='Parse Biosciences technology details:'
          name='technologyDetails'
        >
          <Select
            placeholder='Select the kit you used in your experiment'
            style={{ width: '70%' }}
            value={selectedKit}
            onChange={(value) => changeKit(value)} // Update selected kit on change
          >
            <Option value='wt_mini'>Evercode WT Mini</Option>
            <Option value='wt'>Evercode WT</Option>
            <Option value='wt_mega'>Evercode WT Mega</Option>
          </Select>
        </Form.Item>

        <Title level={5}>Provide details of your experimental design:</Title>
        <Form.Item
          name='numberOfSamples'
          style={{ marginLeft: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>Select the number of samples:</div>
            <Select
              style={{ marginLeft: '10px', width: '20%' }}
              onChange={setNumberOfSamples}
              value={numberOfSamples}
              disabled={!selectedKit}
            >
              {generateOptions(maxSublibraries * 6)}
            </Select>
          </div>
        </Form.Item>
        <Form.Item
          name='numberOfSublibraries'
          style={{ marginLeft: '20px' }}
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
            <Select
              style={{ marginLeft: '10px', width: '20%' }}
              onChange={setNumberOfSublibraries}
              value={numberOfSublibraries}
              disabled={!selectedKit}
            >
              {generateOptions(maxSublibraries)}
            </Select>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

export default NewSecondaryProject;
