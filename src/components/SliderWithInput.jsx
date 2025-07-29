import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Slider, InputNumber, Space } from 'antd';

import _ from 'lodash';

import useConfigUpdate from 'utils/customHooks/useConfigUpdate';

const SliderWithInput = (props) => {
  const {
    min, max, value, onUpdate, disabled, step, debounceTime, sliderMaxWidth,
  } = props;

  const [, handleChange] = useConfigUpdate(onUpdate, value, debounceTime);

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(parseFloat(value));
  }, [value]);

  const stepToSet = step ?? max / 200;

  const slider = (
    <Slider
      value={localValue}
      min={min}
      max={max}
      onChange={setLocalValue}
      onAfterChange={handleChange}
      step={stepToSet}
      disabled={disabled}
      style={{
        minWidth: 100, display: 'inline-block', flexGrow: 100, margin: '0.5em', maxWidth: sliderMaxWidth,
      }}
    />
  );

  const input = (
    <InputNumber
      value={localValue}
      min={min}
      max={max}
      onChange={(changedValue) => {
        if (changedValue === value) { return; }

        const changedValueWithinBounds = _.clamp(changedValue, min, max);

        setLocalValue(changedValueWithinBounds);

        handleChange(changedValueWithinBounds);
      }}
      onPressEnter={() => { handleChange(localValue); }}
      onStep={(newValue) => {
        handleChange(newValue);
      }}
      step={stepToSet}
      disabled={disabled}
      style={{ width: 80, display: 'inline-block' }}
    />
  );

  return (
    <Space align='start' wrap>
      {slider}
      {input}
    </Space>
  );
};

SliderWithInput.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  step: PropTypes.number,
  debounceTime: PropTypes.number,
  sliderMaxWidth: PropTypes.number,
};

SliderWithInput.defaultProps = {
  disabled: false,
  step: null,
  debounceTime: 1000,
  sliderMaxWidth: 200,
};

export default SliderWithInput;
