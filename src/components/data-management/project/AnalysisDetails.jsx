/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { loadSecondaryAnalysisStatus } from 'redux/actions/secondaryAnalyses';

import { layout } from 'utils/constants';

const paddingTop = layout.PANEL_PADDING;
const paddingBottom = layout.PANEL_PADDING;
const paddingRight = layout.PANEL_PADDING;
const paddingLeft = layout.PANEL_PADDING;

const AnalysisDetails = ({ width, height }) => {
  const dispatch = useDispatch();

  const {
    activeSecondaryAnalysisId: activeAnalysisId,
  } = useSelector((state) => state.secondaryAnalyses.meta);
  // const activeAnalysis = useSelector((state) => state.experiments[activeAnalysisId]);

  useEffect(() => {
    if (!activeAnalysisId) return;

    dispatch(loadSecondaryAnalysisStatus(activeAnalysisId));
  }, [activeAnalysisId]);

  return (
    // The height of this div has to be fixed to enable sample scrolling
    <div
      id='secondary-analysis-details'
      style={{
        width: width - paddingLeft - paddingRight,
        height: height - layout.PANEL_HEADING_HEIGHT - paddingTop - paddingBottom,
      }}
    >
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      }}
      >
        toihrmbortimhrtoinm
      </div>
    </div>
  );
};

AnalysisDetails.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default AnalysisDetails;
