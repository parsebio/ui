import React from 'react';
import { Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import FastqFileType from 'const/enums/FastqFileType';
import { updateFastqType } from 'redux/actions/secondaryAnalyses';

const FastqTypeButton = (props) => {
  const { secondaryAnalysisId, fileId } = props;

  const dispatch = useDispatch();

  const type = useSelector(
    (state) => state.secondaryAnalyses[secondaryAnalysisId].files.data[fileId].type,
  );

  const handleButtonClick = (newType) => {
    dispatch(updateFastqType(secondaryAnalysisId, newType, [fileId]));
  };

  return (
    <Select
      value={type}
      onChange={handleButtonClick}
      style={{ width: '100%' }}
      options={[
        { value: FastqFileType.WT_FASTQ, label: 'WT' },
        { value: FastqFileType.IMMUNE_FASTQ, label: 'Immune' },
      ]}
    />
  );
};

FastqTypeButton.propTypes = {
  secondaryAnalysisId: propTypes.string.isRequired,
  fileId: propTypes.string.isRequired,
};

export default FastqTypeButton;
