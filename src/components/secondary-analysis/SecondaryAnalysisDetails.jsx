import React, { useState, useEffect } from 'react';
import {
  Select, Form, Typography, Space,
} from 'antd';
import propTypes from 'prop-types';

const { Title } = Typography;
const { Option } = Select;

const SecondaryAnalysisDetails = (props) => {
  const { setNewSecondaryAnalysisDetailsDiff, secondaryAnalysis } = props;
  const [maxSublibraries, setMaxSublibraries] = useState();
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    setFormValues(secondaryAnalysis);
    calculateMaxSublibraries(secondaryAnalysis.kit);
  }, [secondaryAnalysis]);

  useEffect(() => {
    const fieldsToUpdate = {};
    Object.keys(formValues).forEach((key) => {
      if (secondaryAnalysis[key] !== formValues[key]) {
        fieldsToUpdate[key] = formValues[key];
      }
    });
    setNewSecondaryAnalysisDetailsDiff(fieldsToUpdate);
  }, [formValues]);

  const generateOptions = (end) => Array.from({ length: end }, (_, i) => i + 1).map((value) => (
    <Option key={value} value={`${value}`}>{value}</Option>
  ));

  const calculateMaxSublibraries = (kit) => {
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
    return newMaxSublibraries;
  };

  const changeKit = (kit) => {
    const newMaxSublibraries = calculateMaxSublibraries(kit);
    // changing the kit, changes the default selected number of sublibraries and samples
    setFormValues({
      ...formValues,
      numOfSamples: newMaxSublibraries * 6,
      numOfSublibraries: newMaxSublibraries,
      kit,
    });
  };

  const handleValueChange = (key, value) => {
    setFormValues({
      ...formValues,
      [key]: value,
    });
  };

  return (
    <>
      <Form
        layout='vertical'
        size='middle'
        style={{ width: '100%', margin: '0 auto', height: '50%' }}
        onFinish={(values) => console.log(values)}
      >
        <Form.Item
          label='Parse Biosciences technology details:'
          name='technologyDetails'
        >
          <Space direction='vertical' style={{ width: '70%' }}>
            <Select
              placeholder='Select the kit you used in your experiment'
              value={formValues.kit}
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
              value={formValues.chemistryVersion}
              options={[
                { label: 'v1', value: '1' },
                { label: 'v2', value: '2' },
                { label: 'v3', value: '3' },
              ]}
            />
          </Space>
        </Form.Item>

        <Form.Item
          label='Provide details of your experimental design:'
          name='numOfSamples'
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>Select the number of samples:</div>
            <Select
              style={{ marginLeft: '10px', width: '20%' }}
              onChange={(value) => handleValueChange('numOfSamples', parseInt(value, 10))}
              value={formValues.numOfSamples}
              disabled={!formValues.kit}
            >
              {generateOptions(maxSublibraries * 6)}
            </Select>
          </div>
        </Form.Item>
        <Form.Item
          name='numOfSublibraries'
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
              value={formValues.numOfSublibraries}
              disabled={!formValues.kit}
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
  setNewSecondaryAnalysisDetailsDiff: propTypes.func.isRequired,
  secondaryAnalysis: propTypes.object.isRequired,
};

export default SecondaryAnalysisDetails;
