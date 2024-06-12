import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getChangedStepKeys = (stepKey) => (state) => {
  const currentStepSettings = state.processing[stepKey];
  const originalStepSettings = state.originalProcessing[stepKey];

  const changedKeys = [];

  // Store the key of every entry that changed
  Object.entries(currentStepSettings).forEach(([key, value]) => {
    if (!_.isEqual(value, originalStepSettings[key])) {
      changedKeys.push(key);
    }
  });

  return changedKeys;
};

export default createMemoizedSelector(getChangedStepKeys);
