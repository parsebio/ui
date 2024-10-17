import React, { useState } from 'react';
import { getMetadataToSampleIds } from 'redux/selectors';
import PropTypes from 'prop-types';
import { TreeSelect } from 'antd';
import _ from 'lodash';
import pushNotificationMessage from 'utils/pushNotificationMessage';

const SelectShownSamplesDropdown = (props) => {
  const { shownSamples, setShownSamples, samples } = props;
  const maxSelectedSamples = 10;
  // const [shownMetadata, setShownMetadata] = useState([]);
  const metadataInfo = React.useMemo(() => _.omit(
    getMetadataToSampleIds()({ samples }), ['meta'],
  ), [samples]);

  // const selectedTreeNodes = React.useMemo(() => {
  //   // if (!shownSamples.length) return;
  //   const selectedMetadataNodes = [...shownSamples];

  //   // find which metadata nodes are selected by checking if all samples in the node are selected
  //   Object.entries(metadataInfo).forEach(([metadataTrackKey, entry]) => {
  //     Object.entries(entry).forEach(([metadataValue, sampleIds]) => {
  //       if (sampleIds.every((sampleId) => shownSamples.includes(sampleId))) {
  //         selectedMetadataNodes.push(`metadataCategorical-${metadataTrackKey}-${metadataValue}`);
  //       }
  //     });
  //   });
  //   return selectedMetadataNodes;
  // console.log('SELECTED TREE NODES ', selectedTreeNodes);

  // }, [shownSamples, metadataInfo]);

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
        children: Object.entries(entry).map(([metadataKey, metadataValue]) => ({
          value: `metadataCategorical-${metadataTrackKey}-${metadataKey}`,
          title: metadataKey,
        })),
      })),
    },
  ];

  // returns the associated sample ids if the key is metadata
  // const metadataKeyToSampleIds = (key) => {
  //   const keySplit = key.split('-');
  //   if (keySplit[0] === 'metadataCategorical') {
  //     return metadataInfo[keySplit[1]][keySplit[2]];
  //   }
  // };

  // Handle selection changes
  const onChange = (selectedKeys) => {
    // console.log('SE;ECTED VALUE ', selectedKeys, ' SHOWN SAMPLES ', shownSamples);
    // if the change was a removal, dont convert the selected metadata keys to samples
    // if (selectedKeys.length < shownSamples.length + shownMetadata.length) {
    //   const removedKeys = shownSamples.push(...shownMetadata).filter((value) => !selectedKeys.includes(value));
    //   console.log('REMOVED KEYS ', removedKeys);
    //   const sampleIdsToRemove = [];
    //   const metadataToRemove = [];
    //   removedKeys.forEach((key) => {
    //     if (metadataKeyToSampleIds(key)) {
    //       sampleIdsToRemove.push(...metadataKeyToSampleIds(key));
    //       metadataToRemove.push(key);
    //     } else {
    //       sampleIdsToRemove.push(key);
    //     }
    //   });
    //   setShownSamples(shownSamples.filter((value) => !sampleIdsToRemove.includes(value)));
    //   setShownMetadata(shownMetadata.filter((value) => !metadataToRemove.includes(value)));
    // } else {
    let selectedValues = Array.from(new Set(
      selectedKeys.flatMap((value) => {
        const valueSplit = value.split('-');
        if (valueSplit[0] === 'metadataCategorical') {
          // setShownMetadata([...shownMetadata, value]);
          return metadataInfo[valueSplit[1]][valueSplit[2]];
        }
        return value;
      }),
    ));
    if (selectedValues.length > maxSelectedSamples) {
      pushNotificationMessage('warning', `Too many samples, only first ${maxSelectedSamples} selected will be shown.`, 1);
      selectedValues = selectedValues.slice(0, maxSelectedSamples);
    }
    setShownSamples(selectedValues);
    // }
  };

  return (
    <TreeSelect
      style={{ width: '10vw' }}
      value={shownSamples}
      dropdownStyle={{ minWidth: '30vw' }}
      maxTagCount={0}
      maxTagPlaceholder={(values) => `${values.length} selected`}
      placeholder='Select samples'
      allowClear
      showSearch={false}
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
