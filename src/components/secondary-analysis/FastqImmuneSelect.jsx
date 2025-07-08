import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setImmunePairMatch } from 'redux/actions/secondaryAnalyses';

const FastqImmuneSelect = ({
  sublibraryIndex, pairs,
}) => {
  const dispatch = useDispatch();

  const secondaryAnalysisId = useSelector((state) => (
    state.secondaryAnalyses.meta.activeSecondaryAnalysisId
  ));

  const pairMatches = useSelector((state) => (
    state.secondaryAnalyses[secondaryAnalysisId].files.pairMatches
  ));

  const usedOptions = Object.keys(pairMatches).map((pairName) => ({
    label: <span style={{ color: 'lightgray' }}>{pairName}</span>,
    value: pairName,
  }));

  const freeOptions = Object.keys(pairs)
    .filter((pairName) => _.isNil(pairMatches[pairName]))
    .map((pairName) => ({
      label: pairName,
      value: pairName,
    }));

  const options = [...freeOptions, ...usedOptions];

  const selectedOption = _.findKey(pairMatches, (index) => index === sublibraryIndex);

  return (
    <Select
      options={options}
      style={{ width: '100%' }}
      placeholder='Select immune pair'
      value={selectedOption}
      optionLabelProp='value'
      onSelect={(pairName) => {
        if (selectedOption === pairName) return;

        const newMatches = _.clone(pairMatches);

        newMatches[pairName] = sublibraryIndex;

        if (!_.isNil(selectedOption)) {
          delete newMatches[selectedOption];
        }

        dispatch(setImmunePairMatch(
          secondaryAnalysisId,
          newMatches,
        ));
      }}
    />

  );
};

FastqImmuneSelect.propTypes = {
  sublibraryIndex: PropTypes.number.isRequired,
  pairs: PropTypes.object.isRequired,
};

export default FastqImmuneSelect;
