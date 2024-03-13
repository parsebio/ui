import React, { useState, useEffect, useCallback } from 'react';
import {
  Select, Form, Space, InputNumber,
} from 'antd';
import propTypes from 'prop-types';
import kitOptions from 'utils/secondary-analysis/kitOptions.json';
import SliderWithInput from 'components/SliderWithInput';

const { Option } = Select;
const kitToMaxSublibrariesMap = {
  wt_mini: 2,
  wt: 8,
  wt_mega: 16,
};

const SecondaryAnalysisSettings = (props) => {
  const { onDetailsChanged, secondaryAnalysisDetails } = props;
  const [maxSublibraries, setMaxSublibraries] = useState();
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    setFormValues(secondaryAnalysisDetails);
    calculateMaxSublibraries(secondaryAnalysisDetails.kit);
  }, []);

  useEffect(() => {
    const fieldsToUpdate = {};
    Object.keys(formValues).forEach((key) => {
      if (secondaryAnalysisDetails[key] !== formValues[key]) {
        fieldsToUpdate[key] = formValues[key];
      }
    });
    onDetailsChanged(fieldsToUpdate);
  }, [formValues, onDetailsChanged]);

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
            <div style={{ marginRight: '5px' }}>Select the number of samples:</div>
            <SliderWithInput
              style={{ marginLeft: '20px', width: '20%' }}
              min={1}
              max={maxSublibraries * 6}
              value={formValues.numOfSamples}
              onUpdate={(value) => handleValueChange('numOfSamples', parseInt(value, 10))}
              disabled={!formValues.kit}
              step={1}
              debounceTime={0}
            />
          </div>
        </Form.Item>
        <Form.Item
          name='numOfSublibraries'
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '5px' }}>
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
            <SliderWithInput
              style={{ marginLeft: '20px', width: '20%' }}
              min={1}
              max={maxSublibraries}
              value={formValues.numOfSublibraries}
              onUpdate={(value) => handleValueChange('numOfSublibraries', parseInt(value, 10))}
              disabled={!formValues.kit}
              step={1}
              debounceTime={0}
            />
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

SecondaryAnalysisSettings.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  secondaryAnalysisDetails: propTypes.object.isRequired,
};

export default SecondaryAnalysisSettings;
