import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getMetadataToSampleIds, getSamples } from 'redux/selectors';
import PropTypes from 'prop-types';
import { TreeSelect } from 'antd';
import _ from 'lodash';

const SelectShownSamplesDropdown = (props) => {
  const {
    shownSampleIds, setShownSampleIds, experimentId,
  } = props;

  const [shownMetadata, setShownMetadata] = useState([]);

  const metadataInfo = useSelector(getMetadataToSampleIds(experimentId));
  const samples = useSelector(getSamples(experimentId));
  const sampleIdsOrdered = useSelector((state) => state.experimentSettings.info.sampleIds);

  const samplesWithoutMeta = _.omit(samples, ['meta']);

  let treeData = [];
  if (Object.keys(samplesWithoutMeta).length !== 0) {
    treeData = [
      {
        value: 'samples',
        title: 'Samples - select all',
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
  }

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
    if (selectedKeys.length < shownSampleIds.length + shownMetadata.length) {
      const removedKeys = _.difference([...shownSampleIds, ...shownMetadata], selectedKeys);
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
      setShownSampleIds(shownSampleIds.filter((value) => !sampleIdsToRemove.includes(value)));
      setShownMetadata(shownMetadata.filter((value) => !metadataToRemove.includes(value)));
    } else {
      const addedKeys = _.difference(selectedKeys, [...shownMetadata, ...shownSampleIds]);
      const addedMetada = addedKeys.filter((key) => metadataKeyToSampleIds(key))[0];

      // select all samples
      if (addedKeys[0] === 'samples') {
        setShownSampleIds(sampleIdsOrdered);
        setShownMetadata([]);
      } else if (addedMetada) {
        setShownSampleIds(metadataKeyToSampleIds(addedMetada));
        setShownMetadata([addedMetada]);
      } else {
        setShownSampleIds([...shownSampleIds, ...addedKeys]);
        setShownMetadata([]);
      }
    }
  };

  return (
    <TreeSelect
      style={{ width: '19vw' }}
      value={[...shownSampleIds, ...shownMetadata]}
      dropdownStyle={{ minWidth: '32vw', overflow: 'auto' }}
      maxTagCount={0}
      maxTagPlaceholder={() => `${shownSampleIds.length} samples selected`}
      placeholder='Select samples'
      allowClear
      multiple
      popupMatchSelectWidth={false}
      treeDefaultExpandAll
      onChange={onChange}
      treeData={treeData}
    />
  );
};

SelectShownSamplesDropdown.propTypes = {
  shownSampleIds: PropTypes.array.isRequired,
  setShownSampleIds: PropTypes.func.isRequired,
  experimentId: PropTypes.string.isRequired,
};

export default SelectShownSamplesDropdown;
