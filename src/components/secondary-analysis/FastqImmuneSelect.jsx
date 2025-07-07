import React from 'react';
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

  const options = Object.entries(pairs).map(([pairName, fileIds]) => {
    console.log('pairMatcheswedwDebug');
    console.log(pairMatches);

    return ({
      label: pairName,
      value: pairName,
      disabled: pairMatches[pairName],
    });
  });

  return (
    <Select
      options={options}
      style={{ width: '100%' }}
      placeholder='Select immune pair'
      filterOption={(_input, option) => pairMatches[option.value]}
      onSelect={(pairName) => {
        dispatch(setImmunePairMatch(
          secondaryAnalysisId,
          {
            ...pairMatches,
            [pairName]: sublibraryIndex,
          },
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
