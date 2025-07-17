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
  const samplesToReplace = sampleIds.filter((sampleId) => sampleId !== sourceSampleId);

  samplesToReplace.forEach((sampleIdToReplace) => {
    const sampleToReplaceStepConfig = draft.processing[step][sampleIdToReplace];

    sampleToReplaceStepConfig.auto = sourceSettings.auto;

    if (sourceSettings.auto) {
      sampleToReplaceStepConfig.filterSettings = current(
        sampleToReplaceStepConfig.defaultFilterSettings,
      );
      return;
    }

    sampleToReplaceStepConfig
      .filterSettings = _.cloneDeep(sourceSettings.filterSettings);
  });
}, initialState);

export default copyFilterSettingsToAllSamples;
