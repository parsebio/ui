import _ from 'lodash';
import {
  useState, useCallback, useEffect,
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
 * @param {*} options options for the hook
 * @param {number} options.debounce time in milliseconds to debounce the call to onUpdate
 * @returns
 */
const useLocalState = (onUpdate, value, options = {}) => {
  const { debounce = 0 } = options;

  const updateDebounced = useCallback(
    _.debounce((obj) => onUpdate(obj), debounce),
    [onUpdate],
  );

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!_.isEqual(localValue, value)) {
      setLocalValue(value);
    }
  }, [value]);

  const update = (newValue) => {
    setLocalValue(newValue);
    updateDebounced(newValue);
  };

  return [localValue, update];
};
export default useLocalState;
