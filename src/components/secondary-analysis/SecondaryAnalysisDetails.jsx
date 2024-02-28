import React, { useState, useEffect, useCallback } from 'react';
import {
  Select, Form, Space,
} from 'antd';
import propTypes from 'prop-types';
import kitOptions from 'utils/secondary-analysis/kitOptions.json';

const { Option } = Select;
const kitToMaxSublibrariesMap = {
  wt_mini: 2,
  wt: 8,
  wt_mega: 16,
};

const SecondaryAnalysisDetails = (props) => {
  const { onDetailsChanged, secondaryAnalysis } = props;
  const [maxSublibraries, setMaxSublibraries] = useState();
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    if (!secondaryAnalysis) return;
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
    onDetailsChanged(fieldsToUpdate);
  }, [formValues, secondaryAnalysis, onDetailsChanged]);

  const generateOptions = (end) => Array.from({ length: end }, (_, i) => i + 1).map((value) => (
    <Option key={value} value={`${value}`}>{value}</Option>
  ));

  const calculateMaxSublibraries = useCallback((kit) => {
    const newMaxSublibraries = kitToMaxSublibrariesMap[kit];
    if (!newMaxSublibraries) {
      console.log('INVALID KIT OPTION SELECTED');
      return;
    }
    setMaxSublibraries(newMaxSublibraries);
    return newMaxSublibraries;
  }, []);

  const changeKit = useCallback((kit) => {
    const newMaxSublibraries = calculateMaxSublibraries(kit);
    // changing the kit, changes the default selected number of sublibraries and samples
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      numOfSamples: newMaxSublibraries * 6,
      numOfSublibraries: newMaxSublibraries,
      kit,
    }));
  }, [calculateMaxSublibraries]);

  const handleValueChange = useCallback((key, value) => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [key]: value,
    }));
  }, []);

  return (
    <>
      <Form
        layout='vertical'
        size='middle'
        style={{ width: '100%', margin: '0 auto', height: '50%' }}
      >
        <Form.Item
          label='Parse Biosciences technology details:'
          name='technologyDetails'
        >
          <Space direction='vertical' style={{ width: '70%' }}>
            <Select
              placeholder='Select the kit you used in your experiment'
              value={formValues.kit}
              onChange={changeKit}
              options={kitOptions}
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
  onDetailsChanged: propTypes.func.isRequired,
  secondaryAnalysis: propTypes.object.isRequired,
};

export default SecondaryAnalysisDetails;
