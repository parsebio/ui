import _ from 'lodash';
import {
  useState, useCallback, useEffect,
} from 'react';

// A custom hook for the sliders in plot styling for throttling the dispatching of updates to redux
const useConfigUpdate = (onUpdate, config, debounceTime = 1000) => {
  const updateDebounced = useCallback(_.debounce((obj) => onUpdate(obj), debounceTime), [onUpdate]);
  const [localConfig, setLocalConfig] = useState(config);

  // if the config is changed - update the newConfig too
  useEffect(() => {
    if (!_.isEqual(localConfig, config)) {
      setLocalConfig(config);
    }
  }, [config]);

  const update = (updatedField) => {
    const newConfig = _.cloneDeep(localConfig);
    _.merge(newConfig, updatedField);
    setLocalConfig(newConfig);
    updateDebounced(updatedField);
  };

  return [localConfig, update];
};
export default useConfigUpdate;
