/* eslint-disable no-param-reassign */
import produce from 'immer';
import _ from 'lodash';

import initialState from '../initialState';

const updateSampleProcessingSettingsFromQC = produce((draft, action) => {
  const {
    step, sampleId, newSettings,
  } = action.payload;

  _.set(draft, `processing.${step}.${sampleId}`, newSettings);
  _.set(draft, `originalProcessing.${step}.${sampleId}`, newSettings);
}, initialState);

export default updateSampleProcessingSettingsFromQC;
