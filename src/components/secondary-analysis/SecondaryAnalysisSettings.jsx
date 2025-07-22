import _ from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Select, Form, Space, Switch, Tooltip, Modal,
} from 'antd';
import {
  InfoCircleOutlined,
} from '@ant-design/icons';
import propTypes from 'prop-types';
import kitOptions, { isKitCategory, kitCategories } from 'utils/secondary-analysis/kitOptions';
import { getFastqFiles } from 'redux/selectors';
import SliderWithInput from 'components/SliderWithInput';
import FastqFileType from 'const/enums/FastqFileType';
import { useSelector } from 'react-redux';

const kitToMaxSublibrariesMap = {
  wt_mini: 2,
  wt: 8,
  wt_mega: 16,
  wt_mega_384: 16,
  tcr_mini: 2,
  tcr: 8,
  tcr_mega: 16,
  bcr_mini: 2,
  bcr: 8,
  bcr_mega: 16,
};

const detailsToShow = ['numOfSublibraries', 'chemistryVersion', 'kit', 'refGenome', 'pairedWt'];

const SecondaryAnalysisSettings = (props) => {
  const { secondaryAnalysisId, onDetailsChanged } = props;

  const [maxSublibraries, setMaxSublibraries] = useState();
  const [formValues, setFormValues] = useState({});

  const secondaryAnalysisDetails = useSelector(
    (state) => _.pick(state.secondaryAnalyses[secondaryAnalysisId], detailsToShow),
    _.isEqual,
  );

  const wtFiles = useSelector(
    getFastqFiles(secondaryAnalysisId, FastqFileType.WT_FASTQ),
    _.isEqual,
  );

  const immuneFiles = useSelector(
    getFastqFiles(secondaryAnalysisId, FastqFileType.IMMUNE_FASTQ),
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
  const onKitChange = useCallback(
    (newKit) => {
      // if switching to WT category and there are immune FASTQ files already uploaded
      if (
        isKitCategory(newKit, [kitCategories.WT])
        && Object.keys(immuneFiles).length > 0
      ) {
        Modal.confirm({
          title: 'You have immune profiling FASTQ files uploaded.',
          content:
            'If you switch back to a WT‐only kit, those files won’t be processed. Do you still want to continue? Your files will not be deleted.',
          okText: 'Yes, switch kit',
          cancelText: 'No, keep current kit',
          onOk: () => changeKit(newKit),
        });
      } else {
        changeKit(newKit);
      }
    },
    [immuneFiles, changeKit],
  );

  const changeKit = useCallback((kit) => {
    calculateMaxSublibraries(kit);

    // changing the kit updates defaults for sublibraries and chemistry
    setFormValues((prevFormValues) => {
      let { chemistryVersion, pairedWt } = prevFormValues;

      if (isKitCategory(kit, [kitCategories.TCR, kitCategories.BCR])) {
        pairedWt = true;
        chemistryVersion = '3';
      } else if (kit === 'wt_mega_384') {
        chemistryVersion = '3';
      }

      if (isKitCategory(kit, kitCategories.WT)) {
        pairedWt = false;
      }

      return {
        ...prevFormValues,
        numOfSublibraries: 1,
        chemistryVersion,
        kit,
        pairedWt,
      };
    });
  }, [calculateMaxSublibraries]);

  const handleValueChange = useCallback((key, value) => {
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [key]: value,
    }));
  }, []);

  return (
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
            onChange={onKitChange}
            options={kitOptions}
            virtual={false}
          />

          <Select
            placeholder='Select the chemistry version'
            onChange={(value) => handleValueChange('chemistryVersion', value)}
            value={formValues.chemistryVersion}
            options={[
              { label: 'v1', value: '1', disabled: isKitCategory(formValues.kit, kitCategories.TCR) },
              { label: 'v2', value: '2' },
              { label: 'v3', value: '3' },
            ]}
            disabled={formValues.kit === 'wt_mega_384' || isKitCategory(formValues.kit, kitCategories.BCR)}
          />
        </Space>
      </Form.Item>

      {formValues.kit && (
        <Form.Item name='numOfSublibraries'>
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
      )}
      {isKitCategory(formValues.kit, [kitCategories.TCR, kitCategories.BCR]) && (
        <Form.Item name='pairedWt'>
          <Space direction='horizontal'>
            <Switch
              checked={formValues.pairedWt}
              onChange={(value) => {
                if (!value && secondaryAnalysisDetails.pairedWt
                  && Object.keys(wtFiles).length > 0) {
                  Modal.confirm({
                    title: 'You have WT Fastq files uploaded.',
                    content: () => 'Do you want to disable paired WT mode? Your files will not be deleted.',
                    okText: 'Yes, disable',
                    cancelText: 'Cancel',
                    onOk: () => handleValueChange('pairedWt', false),
                  });
                } else {
                  handleValueChange('pairedWt', value);
                }
              }}
            />
            <span style={{ marginRight: '10px' }}>
              Run the pipeline with paired Whole Transcriptome and immune profiling data
            </span>
            <Tooltip title='If you have paired Whole Transcription (WT) and immune profiling (TCR or BCR) FASTQ files, set the toggle to ‘on’.
             If you only have immune data with no parent WT FASTQ files, set the toggle to ‘off’'
            >
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
};

SecondaryAnalysisSettings.propTypes = {
  secondaryAnalysisId: propTypes.string.isRequired,
  onDetailsChanged: propTypes.func.isRequired,
};

export default SecondaryAnalysisSettings;
