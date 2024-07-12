import _ from 'lodash';
import {
  useState, useCallback, useEffect,
} from 'react';

// A custom hook for the sliders in plot styling for throttling the dispatching of updates to redux
const useUpdateDebounced = (onUpdate, value, throttleTime = 1000) => {
  const updateDebounced = useCallback(_.debounce((obj) => onUpdate(obj), throttleTime), [onUpdate]);
  const [newValue, setNewValue] = useState(value);
  // if the config is changed - update the newConfig too
  useEffect(() => {
    if (!_.isEqual(newValue, value)) {
      setNewValue(value);
    }
  }, [value]);

  const update = (updatedField) => {
    const changes = _.cloneDeep(newValue);
    _.merge(changes, updatedField);
    setNewValue(changes);
    updateDebounced(updatedField);
  };
  return [newValue, update];
};
export default useUpdateDebounced;
