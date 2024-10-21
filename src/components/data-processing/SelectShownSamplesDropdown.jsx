import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getMetadataToSampleIds, getSamples } from 'redux/selectors';
import PropTypes from 'prop-types';
import { TreeSelect } from 'antd';
import _ from 'lodash';

const SelectShownSamplesDropdown = (props) => {
  const {
    shownSamples, setShownSamples, experimentId,
  } = props;

  const [shownMetadata, setShownMetadata] = useState([]);

  const metadataInfo = useSelector(getMetadataToSampleIds(experimentId));
  const samples = useSelector(getSamples(experimentId));
  const sampleIdsOrdered = useSelector((state) => state.experimentSettings.info.sampleIds);

  const samplesWithoutMeta = _.omit(samples, ['meta']);

  const treeData = [
    {
      value: 'samples',
      title: 'Samples',
      disabled: true,
      children: sampleIdsOrdered.map((key) => {
        const entry = samplesWithoutMeta[key];
        return {
          value: key,
          title: entry.name,
        };
      }),
    },
    ...(Object.keys(metadataInfo).length > 0 ? [{
      value: 'metadata',
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
    }] : []),
  ];

  // returns the associated sample ids if the key is metadata
  const metadataKeyToSampleIds = (key) => {
    const [cellSetType, metadataTrackKey, metadataValueKey] = key.split('-');
    if (cellSetType === 'metadataCategorical') {
      return metadataInfo[metadataTrackKey][metadataValueKey];
    }
  };

  // Handle selection changes
  const onChange = (selectedKeys) => {
    // if a key is removed
    if (selectedKeys.length < shownSamples.length + shownMetadata.length) {
      const removedKeys = _.difference([...shownSamples, ...shownMetadata], selectedKeys);
      const sampleIdsToRemove = [];
      const metadataToRemove = [];
      removedKeys.forEach((key) => {
        const sampleIdsFromMetadata = metadataKeyToSampleIds(key);
        if (sampleIdsFromMetadata) {
          sampleIdsToRemove.push(...sampleIdsFromMetadata);
          metadataToRemove.push(key);
        } else {
          sampleIdsToRemove.push(key);
          metadataToRemove.push(...shownMetadata);
        }
      });
      setShownSamples(shownSamples.filter((value) => !sampleIdsToRemove.includes(value)));
      setShownMetadata(shownMetadata.filter((value) => !metadataToRemove.includes(value)));
    } else {
      const addedKeys = _.difference(selectedKeys, [...shownMetadata, ...shownSamples]);
      const addedMetada = addedKeys.filter((key) => metadataKeyToSampleIds(key))[0];

      if (addedMetada) {
        setShownSamples(metadataKeyToSampleIds(addedMetada));
        setShownMetadata([addedMetada]);
      } else {
        setShownSamples([...shownSamples, ...addedKeys]);
        setShownMetadata([]);
      }
    }
  };

  return (
    <TreeSelect
      style={{ width: '19vw' }}
      value={[...shownSamples, ...shownMetadata]}
      dropdownStyle={{ minWidth: '32vw', overflow: 'auto' }}
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
  experimentId: PropTypes.string.isRequired,
};
export default SelectShownSamplesDropdown;
