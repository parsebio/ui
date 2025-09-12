import _ from 'lodash';
import {
  useState, useEffect,
} from 'react';

/**
 *
 * Adds a side effect to a local state update, to call an additional external update function
 * @param {*} onUpdate external update function
 * @param {*} value external value
 * @returns
 */
const useLocalState = (onUpdate, value) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!_.isEqual(localValue, value)) {
      setLocalValue(value);
    }
  }, [value]);

  const update = (newValue) => {
    setLocalValue(newValue);
    onUpdate(newValue);
  };

  return [localValue, update];
};

export default useLocalState;
