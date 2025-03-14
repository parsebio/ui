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

      <p><strong>Label options</strong></p>
      <Form.Item>
        <Radio.Group
          onChange={(e) => onUpdate({ labels: { enabled: e.target.value } })}
          value={config.labels.enabled}
        >
          <Radio value>Show</Radio>
          <Radio value={false}>Hide</Radio>
        </Radio.Group>
      </Form.Item>

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
      <Form.Item
        label='Repel'
        style={{ marginTop: '10px' }}
      >
        <Slider
          value={newConfig.labels.overlapRepel}
          min={0.0}
          max={5.0}
          step={0.1}
          disabled={!config.labels.enabled}
          onChange={(value) => {
            handleChange({ labels: { overlapRepel: value } });
          }}
          marks={{ 0: 0.0, 50: 5 }}
        />
      </Form.Item>
    </Form>
  );
};

LabelsDesign.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export default LabelsDesign;
