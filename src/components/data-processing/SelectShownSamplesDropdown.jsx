import React, { useState } from 'react';
import { getMetadataToSampleIds } from 'redux/selectors';
import PropTypes from 'prop-types';
import { TreeSelect } from 'antd';
import _ from 'lodash';
import pushNotificationMessage from 'utils/pushNotificationMessage';

const SelectShownSamplesDropdown = (props) => {
  const { shownSamples, setShownSamples, samples } = props;
  const maxSelectedSamples = 10000;
  const [shownMetadata, setShownMetadata] = useState([]);
  const metadataInfo = React.useMemo(() => _.omit(
    getMetadataToSampleIds()({ samples }), ['meta'],
  ), [samples]);

  const samplesWithoutMeta = _.omit(samples, ['meta']);

  const treeData = [
    {
      value: 'samples',
      title: 'Samples',
      disabled: true,
      // todo ignore 'meta' key
      children: Object.entries(samplesWithoutMeta).map(([key, entry]) => ({
        value: key,
        title: entry.name,
      })),
    },
    {
      value: 'metdata',
      disabled: true,
      title: 'Metadata tracks',
      children: Object.entries(metadataInfo).map(([metadataTrackKey, entry]) => ({
        value: metadataTrackKey,
        disabled: true,
        title: metadataTrackKey,
        children: Object.entries(entry).map(([metadataKey]) => ({
          value: `metadataCategorical-${metadataTrackKey}-${metadataKey}`,
          title: metadataKey,
        })),
      })),
    },
  ];

  // returns the associated sample ids if the key is metadata
  const metadataKeyToSampleIds = (key) => {
    const keySplit = key.split('-');
    if (keySplit[0] === 'metadataCategorical') {
      return metadataInfo[keySplit[1]][keySplit[2]];
    }
  };

  // Handle selection changes
  const onChange = (selectedKeys) => {
    // if a key is removed
    if (selectedKeys.length < shownSamples.length + shownMetadata.length) {
      const removedKeys = [...shownSamples, ...shownMetadata]
        .filter((value) => !selectedKeys.includes(value));
      const sampleIdsToRemove = [];
      const metadataToRemove = [];
      removedKeys.forEach((key) => {
        if (metadataKeyToSampleIds(key)) {
          sampleIdsToRemove.push(...metadataKeyToSampleIds(key));
          metadataToRemove.push(key);
        } else {
          sampleIdsToRemove.push(key);
          metadataToRemove.push(...shownMetadata);
        }
      });
      setShownSamples(shownSamples.filter((value) => !sampleIdsToRemove.includes(value)));
      setShownMetadata(shownMetadata.filter((value) => !metadataToRemove.includes(value)));
    } else {
      let selectedValues = Array.from(new Set(
        selectedKeys.flatMap((value) => {
          const metadataToSampleIds = metadataKeyToSampleIds(value);
          if (metadataToSampleIds) {
            setShownMetadata([...shownMetadata, value]);
            return metadataToSampleIds;
          }
          setShownMetadata([]);
          return value;
        }),
      ));
      if (selectedValues.length > maxSelectedSamples) {
        pushNotificationMessage('warning', `Too many samples, only first ${maxSelectedSamples} selected will be shown.`, 1);
        selectedValues = selectedValues.slice(0, maxSelectedSamples);
      }
      setShownSamples(selectedValues);
    }
  };

  return (
    <TreeSelect
      style={{ width: '14vw' }}
      value={[...shownSamples, ...shownMetadata]}
      dropdownStyle={{ minWidth: '32vw' }}
      maxTagCount={0}
      maxTagPlaceholder={() => `${shownSamples.length} samples selected`}
      placeholder='Select samples'
      allowClear
      // showSearch={false}
      multiple
      popupMatchSelectWidth={false}
      treeDefaultExpandAll
      onChange={onChange}
      treeData={treeData}
    />
  );
};

SelectShownSamplesDropdown.propTypes = {
  shownSamples: PropTypes.array.isRequired,
  setShownSamples: PropTypes.func.isRequired,
  samples: PropTypes.object.isRequired,
};
export default SelectShownSamplesDropdown;
