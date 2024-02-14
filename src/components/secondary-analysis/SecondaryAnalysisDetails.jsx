import React, { useState } from 'react';
import {
  Select, Form, Typography, Space,
} from 'antd';
import propTypes from 'prop-types';

const { Title } = Typography;
const { Option } = Select;

const SecondaryAnalysisDetails = (props) => {
  const { newProjectDetails, setNewProjectDetails } = props;
  const [form] = Form.useForm();
  const [maxSublibraries, setMaxSublibraries] = useState();

  const generateOptions = (end) => Array.from({ length: end }, (_, i) => i + 1).map((value) => (
    <Option key={value} value={`${value}`}>{value}</Option>
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
        console.log('INVALID OPTION SELECTED');
    }
    setMaxSublibraries(newMaxSublibraries);
    // changing the kit, changes the default selected number of sublibraries and samples
    setNewProjectDetails({
      ...newProjectDetails,
      numOfSamples: newMaxSublibraries * 6,
      numOfSublibraries: newMaxSublibraries,
      kit,
    });
  };

  // Update handlers for setting values directly in newProjectDetails
  const handleValueChange = (key, value) => {
    setNewProjectDetails({
      ...newProjectDetails,
      [key]: value,
    });
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
        {/* <Form.Item
          label='Run name (you can change this later):'
          name='projectName'
        >
          <Input
            style={{ width: '70%' }}
            value={newProjectDetails.name}
            onChange={(e) => handleValueChange('name', e.target.value)}
            placeholder='Ex.: Mouse lymph node dataset'
          />
        </Form.Item> */}
        <Form.Item
          label='Parse Biosciences technology details:'
          name='technologyDetails'
        >
          <Space direction='vertical' style={{ width: '70%' }}>
            <Select
              placeholder='Select the kit you used in your experiment'
              value={newProjectDetails.kit}
              onChange={(value) => changeKit(value)}
              options={[
                { label: 'Evercode WT Mini', value: 'wt_mini' },
                { label: 'Evercode WT', value: 'wt' },
                { label: 'Evercode WT Mega', value: 'wt_mega' },
              ]}
            />

            <Select
              placeholder='Select the chemistry version'
              onChange={(value) => handleValueChange('chemistryVersion', value)}
              value={newProjectDetails.chemistryVersion}
              options={[
                { label: 'v1', value: '1' },
                { label: 'v2', value: '2' },
                { label: 'v3', value: '3' },
              ]}
            />
          </Space>
        </Form.Item>

        <Title level={5}>Provide details of your experimental design:</Title>
        <Form.Item
          name='numOfSamples'
          style={{ marginLeft: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>Select the number of samples:</div>
            <Select
              style={{ marginLeft: '10px', width: '20%' }}
              onChange={(value) => handleValueChange('numOfSamples', parseInt(value, 10))}
              value={newProjectDetails.numOfSamples}
              disabled={!newProjectDetails.kit}
            >
              {generateOptions(maxSublibraries * 6)}
            </Select>
          </div>
        </Form.Item>
        <Form.Item
          name='numOfSublibraries'
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
              onChange={(value) => handleValueChange('numOfSublibraries', parseInt(value, 10))}
              value={newProjectDetails.numOfSublibraries}
              disabled={!newProjectDetails.kit}
            >
              {generateOptions(maxSublibraries)}
            </Select>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

SecondaryAnalysisDetails.propTypes = {
  newProjectDetails: propTypes.object.isRequired,
  setNewProjectDetails: propTypes.func.isRequired,
};

export default SecondaryAnalysisDetails;
