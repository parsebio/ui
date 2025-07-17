import _ from 'lodash';
/* eslint-disable no-param-reassign */
import produce, { current } from 'immer';

import initialState from '../initialState';

const useDefaultFilterSettings = (draft, step, sampleId) => {
  draft.processing[step][sampleId].filterSettings = current(
    draft.processing[step][sampleId].defaultFilterSettings,
  );
};

const copyFilterSettingsToAllSamples = produce((draft, action) => {
  const { step, sourceSampleId, sampleIds } = action.payload;

  const sourceSettings = current(draft.processing[step][sourceSampleId]);
  const targetSamples = sampleIds.filter((sampleId) => sampleId !== sourceSampleId);

  targetSamples.forEach((targetSampleId) => {
    const targetSampleStepConfig = draft.processing[step][targetSampleId];

    targetSampleStepConfig.auto = sourceSettings.auto;

    if (sourceSettings.auto) {
      targetSampleStepConfig.filterSettings = current(
        targetSampleStepConfig.defaultFilterSettings,
      );
      return;
    }

    targetSampleStepConfig
      .filterSettings = _.cloneDeep(sourceSettings.filterSettings);
  });
}, initialState);

export default copyFilterSettingsToAllSamples;
