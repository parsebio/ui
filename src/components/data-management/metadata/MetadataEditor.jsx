/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Popover, Button, Space, Divider, Tooltip, Select,
} from 'antd';
import { FormatPainterOutlined } from '@ant-design/icons';

const MetadataEditor = (props) => {
  const {
    onReplaceEmpty,
    onReplaceAll,
    onClearAll,
    massEdit,
    children,
    samplesList,
    ...restOfProps
  } = props;

  const [value, setValue] = useState('');
  const [selectedSamples, setSelectedSamples] = useState([]);

  const onChange = (e) => {
    setValue(e?.target?.value);
  };

  const onSampleSelectChange = (selectedValues) => {
    setSelectedSamples(selectedValues);
  };

  const resetFields = () => {
    setValue('');
    setSelectedSamples([]);
  };

  const getContent = () => (
    <Space direction='vertical'>
      {React.cloneElement(children, {
        onChange,
        value,
      })}

      <Tooltip title='Select samples (leave empty to apply to all)' placement='left'>
        <Select
          mode='multiple'
          showSearch
          allowClear
          placeholder='Select samples (leave empty to apply to all)'
          onChange={onSampleSelectChange}
          value={selectedSamples}
          style={{ width: '100%' }}
          maxTagCount={2}
          optionFilterProp='children'
          filterOption={(input, option) => option
            .children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {samplesList.map((sample) => (
            <Select.Option key={sample.sampleUuid} value={sample.sampleUuid}>
              {sample.name}
            </Select.Option>
          ))}
        </Select>
      </Tooltip>

      <Divider style={{ margin: '4px 0' }} />

      {massEdit
        ? (
          <Space>
            <Button
              type='primary'
              size='small'
              onClick={() => {
                onReplaceEmpty(value, selectedSamples);
                resetFields();
              }}
            >
              Fill missing
            </Button>
            <Button
              size='small'
              onClick={() => {
                onReplaceAll(value, selectedSamples);
                resetFields();
              }}
            >
              Replace
            </Button>
            <Button
              type='warning'
              size='small'
              onClick={() => {
                onClearAll(selectedSamples);
                resetFields();
              }}
            >
              Clear
            </Button>
          </Space>
        )
        : (
          <Space>
            <Button type='primary' size='small'>Save</Button>
            <Button size='small'>Cancel</Button>
          </Space>
        )}
    </Space>
  );

  return (
    <Tooltip title='Change multiple'>
      <Popover title='Fill metadata' content={getContent()} trigger='click'>
        <Button size='small' shape='circle' icon={<FormatPainterOutlined />} {...restOfProps} />
      </Popover>
    </Tooltip>
  );
  /* eslint-enable react/jsx-props-no-spreading */
};

MetadataEditor.propTypes = {
  onReplaceEmpty: PropTypes.func.isRequired,
  onReplaceAll: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  massEdit: PropTypes.bool,
  samplesList: PropTypes.arrayOf(PropTypes.shape({
    sampleUuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

MetadataEditor.defaultProps = {
  massEdit: false,
};

export default MetadataEditor;
