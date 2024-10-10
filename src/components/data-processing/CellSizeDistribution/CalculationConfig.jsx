import React from 'react';
import PropTypes from 'prop-types';
import {
  InputNumber,
  Form,
  Space,
  Tooltip,
} from 'antd';

import {
  InfoCircleOutlined,
} from '@ant-design/icons';
import SliderWithInput from '../../SliderWithInput';

const MIN_CELL_SIZE_PLACEHOLDER = 10800;

const CellSizeDistributionConfig = (props) => {
  const {
    config, disabled, updateSettings, highestUmi, plotType,
  } = props;

  const withinRange = (cellSize) => Math.max(Math.min(cellSize, highestUmi), 0);

  let maxBinStep = Math.round(highestUmi / 25) || 500;
  // default value comes as 200 from the pipeline so can't have a lower maximum than that
  maxBinStep = maxBinStep < 200 ? 200 : maxBinStep;

  return (
    <>

      <Form.Item disabled label='Minimum #transcripts per cell'>
        <Space>
          <Tooltip title='The cut-off is automatically calculated as the inflection point of the knee plot. The inflection point is used to differentiate cell barcodes originating from intact cells and those arising from the background medium (contains ambient RNA). The number of transcripts per cell varies depending on cell type. The typical minimum threshold range approx. 500-2000.'>
            <InfoCircleOutlined />
          </Tooltip>
          <InputNumber
            value={config.minCellSize}
            onChange={(value) => {
              updateSettings({ minCellSize: withinRange(value) });
            }}
            onPressEnter={(e) => {
              updateSettings({ minCellSize: withinRange(e.target.value) });
            }}
            placeholder={MIN_CELL_SIZE_PLACEHOLDER}
            step={100}
            disabled={disabled}
            max={highestUmi}
            min={0}
          />
        </Space>
      </Form.Item>

      <Form.Item label='Bin step'>
        <SliderWithInput
          min={100}
          max={maxBinStep}
          step={10}
          value={config.binStep}
          onUpdate={(value) => {
            updateSettings({ binStep: value });
          }}
          disabled={disabled || plotType === 'kneePlot'}
        />
      </Form.Item>
    </>
  );
};
CellSizeDistributionConfig.defaultProps = {
  updateSettings: () => {},
  config: {},
  disabled: false,
  highestUmi: null,
  plotType: null,
};
CellSizeDistributionConfig.propTypes = {
  updateSettings: PropTypes.func,
  config: PropTypes.object,
  disabled: PropTypes.bool,
  highestUmi: PropTypes.number,
  plotType: PropTypes.string,
};

export default CellSizeDistributionConfig;
