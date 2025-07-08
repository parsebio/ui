import React, { useMemo } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updatePairMatch } from 'redux/actions/secondaryAnalyses';
import FastqFileType from 'const/enums/FastqFileType';

const FastqImmuneSelect = ({
  wtPairName,
  pairs,
}) => {
  const dispatch = useDispatch();

  const secondaryAnalysisId = useSelector((state) => (
    state.secondaryAnalyses.meta.activeSecondaryAnalysisId
  ));

  const pairMatches = useSelector((state) => (
    state.secondaryAnalyses[secondaryAnalysisId].files.pairMatches
  ));

  const options = useMemo(() => {
    const usedOptions = Object.keys(pairMatches).map((immunePairName) => ({
      label: <span style={{ color: 'lightgray' }}>{immunePairName}</span>,
      value: immunePairName,
    }));

    const freeOptions = Object.keys(pairs[FastqFileType.IMMUNE_FASTQ])
      .filter((immunePairName) => _.isNil(pairMatches[immunePairName]))
      .map((immunePairName) => ({
        label: immunePairName,
        value: immunePairName,
      }));

    return [...freeOptions, ...usedOptions];
  });

  const selectedImmune = _.findKey(pairMatches, (wtPairNameIt) => wtPairNameIt === wtPairName);

  return (
    <Select
      options={options}
      style={{ width: '100%' }}
      placeholder='Select immune pair'
      value={selectedImmune}
      optionLabelProp='value'
      onSelect={(immunePairName) => {
        if (selectedImmune === immunePairName) return;

        const newMatches = _.clone(pairMatches);

        newMatches[immunePairName] = wtPairName;

        if (!_.isNil(selectedImmune)) {
          delete newMatches[selectedImmune];
        }

        dispatch(updatePairMatch(
          secondaryAnalysisId,
          newMatches,
          pairs,
        ));
      }}
    />

  );
};

FastqImmuneSelect.propTypes = {
  wtPairName: PropTypes.string.isRequired,
  pairs: PropTypes.object.isRequired,
};

export default FastqImmuneSelect;
