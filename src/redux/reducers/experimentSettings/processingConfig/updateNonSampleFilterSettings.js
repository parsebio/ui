import _ from 'lodash';
/* eslint-disable no-param-reassign */
import produce, { current } from 'immer';

import { mergeObjectReplacingArrays } from 'utils/arrayUtils';
import { downsamplingMethods } from 'utils/constants';
import initialState from '../initialState';

const seuratV4Compatibility = (newConfig) => {
  if (
    newConfig.dataIntegration.method === 'seuratv4'
    && newConfig.downsampling.method === downsamplingMethods.GEOSKETCH
  ) {
    newConfig.downsampling.method = downsamplingMethods.NONE;
  }
};

const compatiblityUpdates = [
  seuratV4Compatibility,
];

const updateNonSampleFilterSettings = produce((draft, action) => {
  const { step, configChange, isALocalChange } = action.payload;

  if (!step) throw new Error(`Invalid step parameter received: ${step}`);

  const originalProcessingConfig = current(draft.processing)[step] ?? {};

  const newConfig = _.cloneDeep(originalProcessingConfig);

  mergeObjectReplacingArrays(
    newConfig,
    configChange,
  );

  compatiblityUpdates.forEach((update) => { update(newConfig); });

  draft.processing[step] = newConfig;

  if (!isALocalChange) {
    draft.originalProcessing[step] = newConfig;
  }
}, initialState);

export default updateNonSampleFilterSettings;
