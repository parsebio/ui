import _ from 'lodash';
import {
  useState, useEffect,
} from 'react';

/**
 *
 * Acts as a middle man between an external value and a its local representation.
 * It's useful for cases where we want the local and external states no to be completely in sync.
 * In particular,
 * - the external state can "lag" behind the local one
 * - the local state updates immediately when the external one changes.
 *
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
