import React from 'react';
import { Select } from 'antd';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import FastqFileType from 'const/enums/FastqFileType';
import { updateFastqType } from 'redux/actions/secondaryAnalyses';
import { labelsByFastqType } from 'utils/secondary-analysis/kitOptions';

const { WT_FASTQ, IMMUNE_FASTQ } = FastqFileType;

const FastqTypeButton = (props) => {
  const { secondaryAnalysisId, fileId, editable } = props;

  const dispatch = useDispatch();

  const type = useSelector(
    (state) => state.secondaryAnalyses[secondaryAnalysisId].files.data[fileId].type,
  );

  const handleButtonClick = (newType) => {
    dispatch(updateFastqType(secondaryAnalysisId, newType, [fileId]));
  };

  if (!editable) {
    return labelsByFastqType[type];
  }

  return (
    <Select
      value={type}
      onChange={handleButtonClick}
      style={{ width: '100%' }}
      options={
        [WT_FASTQ, IMMUNE_FASTQ].map((fastqType) => ({
          value: fastqType,
          label: labelsByFastqType[fastqType],
        }))
      }
    />
  );
};

FastqTypeButton.propTypes = {
  secondaryAnalysisId: propTypes.string.isRequired,
  fileId: propTypes.string.isRequired,
  editable: propTypes.bool,
};

FastqTypeButton.defaultProps = {
  editable: true,
};

export default FastqTypeButton;
