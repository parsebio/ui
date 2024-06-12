import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getChangedStepKeys = (stepKey) => (state) => {
  const currentStepSettings = state.processing[stepKey];
  const originalStepSettings = state.originalProcessing[stepKey];

  const changedKeys = new Set();

  // The processing config hasn't loaded yet
  if (_.isNil(currentStepSettings)) return [];

  // Store the key of every entry that changed
  Object.entries(currentStepSettings).forEach(([key, value]) => {
    if (!_.isEqual(value, originalStepSettings[key])) {
      changedKeys.add(key);
    }
  });

  return changedKeys;
};

export default createMemoizedSelector(getChangedStepKeys);
