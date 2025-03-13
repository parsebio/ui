import React from 'react';
import PropTypes from 'prop-types';
import {
  Radio, Form, Slider,
} from 'antd';
import useUpdateDebounced from 'utils/customHooks/useUpdateDebounced';

const LabelsDesign = (props) => {
  const { config, onUpdate } = props;
  const [newConfig, handleChange] = useUpdateDebounced(onUpdate, config);
  const minLabelSize = 0;
  const maxLabelSize = 50;

  return (
    <Form>

      <p><strong>Toggle Labels</strong></p>
      <Form.Item>
        <Radio.Group
          onChange={(e) => onUpdate({ labels: { enabled: e.target.value } })}
          value={config.labels.enabled}
        >
          <Radio value>Show</Radio>
          <Radio value={false}>Hide</Radio>
        </Radio.Group>
      </Form.Item>

      <p><strong>Label Options</strong></p>
      <Form.Item
        label='Size'
      >
        <Slider
          value={newConfig.labels.size}
          min={minLabelSize}
          max={maxLabelSize}
          disabled={!config.labels.enabled}
          onChange={(value) => {
            handleChange({ labels: { size: value } });
          }}
          marks={{ 0: minLabelSize, 50: maxLabelSize }}
        />
      </Form.Item>
      <p><strong>Overlap</strong></p>
      <Form.Item
        label=''
      >
        <Radio.Group
          onChange={(e) => onUpdate({ labels: { overlapAvoid: { enabled: e.target.value } } })}
          value={config.labels.overlapAvoid?.enabled ?? false}
          disabled={!config.labels.enabled}
        >
          <Radio value>Avoid</Radio>
          <Radio value={false}>Ignore</Radio>
        </Radio.Group>
        <Form.Item
          label='Strength'
          style={{ marginTop: '10px' }}
        >
          <Slider
            value={newConfig.labels.overlapAvoid.strength}
            min={0.1}
            max={5.0}
            step={0.1}
            disabled={!config.labels.enabled || !config.labels.overlapAvoid.enabled}
            onChange={(value) => {
              handleChange({ labels: { overlapAvoid: { strength: value } } });
            }}
            marks={{ 0: 0.1, 50: 5 }}
          />
        </Form.Item>
      </Form.Item>
    </Form>
  );
};

LabelsDesign.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export default LabelsDesign;
