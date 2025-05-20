import React from 'react';
import PropTypes from 'prop-types';

import { generateDataProcessingPlotUuid } from 'utils/generateCustomPlotUuid';

import FilterPlotLayout from 'components/data-processing/FilterPlotLayout';
import generateFractionHistogramSpec from 'utils/plotSpecs/generateMitochondrialFractionHistogram';
import generateFractionScatterplotSpec from 'utils/plotSpecs/generateMitochondrialFractionScatterplot';
import CalculationConfig from './CalculationConfig';

const filterName = 'mitochondrialContent';

const MitochondrialContent = (props) => {
  const {
    experimentId, sampleId, sampleIds, onConfigChange, stepDisabled, stepHadErrors,
  } = props;
  const filterTableUuid = generateDataProcessingPlotUuid(sampleId, filterName, 2);

  const plots = {
    histogram: {
      title: 'Mitochondrial Fraction',
      plotUuid: generateDataProcessingPlotUuid(sampleId, filterName, 0),
      plotType: 'mitochondrialFractionHistogram',
      specGenerator: generateFractionHistogramSpec,
    },
    logHistogram: {
      title: 'Mitochondrial Fraction (Log)',
      plotUuid: generateDataProcessingPlotUuid(sampleId, filterName, 1),
      plotType: 'mitochondrialFractionLogHistogram',
      specGenerator: generateFractionScatterplotSpec,
    },
  };

  const plotStylingControlsConfig = [
    {
      panelTitle: 'Legend',
      controls: ['legend'],
    },
    {
      panelTitle: 'Plot Dimensions',
      controls: ['dimensions'],
    },
    {
      panelTitle: 'Axes',
      controls: ['axesWithRanges'],
    },
    {
      panelTitle: 'Title',
      controls: ['title'],
    },
    {
      panelTitle: 'Font',
      controls: ['font'],
    },
  ];

  const renderCalculationConfig = () => <CalculationConfig />;

  return (
    <FilterPlotLayout
      experimentId={experimentId}
      plots={plots}
      filterName={filterName}
      filterTableUuid={filterTableUuid}
      sampleId={sampleId}
      sampleIds={sampleIds}
      onConfigChange={onConfigChange}
      stepDisabled={stepDisabled}
      plotStylingControlsConfig={plotStylingControlsConfig}
      renderCalculationConfig={renderCalculationConfig}
      stepHadErrors={stepHadErrors}
    />
  );
};

MitochondrialContent.propTypes = {
  experimentId: PropTypes.string.isRequired,
  sampleId: PropTypes.string.isRequired,
  sampleIds: PropTypes.array.isRequired,
  onConfigChange: PropTypes.func.isRequired,
  stepDisabled: PropTypes.bool,
  stepHadErrors: PropTypes.bool.isRequired,
};

MitochondrialContent.defaultProps = {
  stepDisabled: false,
};

export default MitochondrialContent;
