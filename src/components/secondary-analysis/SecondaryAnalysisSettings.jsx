import _ from 'lodash';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Select, Form, Space,
} from 'antd';
import propTypes from 'prop-types';
import kitOptions from 'utils/secondary-analysis/kitOptions.json';
import SliderWithInput from 'components/SliderWithInput';
import { useSelector } from 'react-redux';

const kitToMaxSublibrariesMap = {
  wt_mini: 2,
  wt: 8,
  wt_mega: 16,
  wt_mega_384: 16,
};

const detailsToShow = ['numOfSublibraries', 'chemistryVersion', 'kit', 'refGenome'];

const SecondaryAnalysisSettings = (props) => {
  const { secondaryAnalysisId, onDetailsChanged } = props;

  const [maxSublibraries, setMaxSublibraries] = useState();
  const [formValues, setFormValues] = useState({});

  const secondaryAnalysisDetails = useSelector(
    (state) => _.pick(state.secondaryAnalyses[secondaryAnalysisId], detailsToShow),
    _.isEqual,
  );

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
      return;
    }
    setMaxSublibraries(newMaxSublibraries);
    return newMaxSublibraries;
  }, []);

  const changeKit = useCallback((kit) => {
    calculateMaxSublibraries(kit);

    // changing the kit, changes the default selected number of sublibraries and samples
    setFormValues((prevFormValues) => {
      const chemistryVersion = kit === 'wt_mega_384' ? '3' : prevFormValues.chemistryVersion;

      return ({
        ...prevFormValues,
        numOfSublibraries: 1,
        chemistryVersion,
        kit,
      });
    });
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
        style={{ width: '90%', height: '50%' }}
      >
        <Form.Item
          label='Parse Biosciences technology details:'
          name='technologyDetails'
        >
          <Space direction='vertical' style={{ width: '92%' }}>
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
              disabled={formValues.kit === 'wt_mega_384'}
            />
          </Space>
        </Form.Item>

        {formValues.kit && (
          <>
            <Form.Item
              name='numOfSublibraries'
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '5px' }}>
                  Number of
                  {' '}
                  <a
                    href='https://support.parsebiosciences.com/hc/en-us/articles/360052394312-What-is-a-sublibrary-'
                    target='_blank'
                    rel='noreferrer'
                  >
                    sublibraries
                  </a>
                  {' '}
                  to be processed in this pipeline run. Note that this number should match
                  the number of FASTQ file pairs that you plan to upload.
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
          </>
        )}
      </Form>
    </>
  );
};

SecondaryAnalysisSettings.propTypes = {
  secondaryAnalysisId: propTypes.string.isRequired,
  onDetailsChanged: propTypes.func.isRequired,
};

export default SecondaryAnalysisSettings;
