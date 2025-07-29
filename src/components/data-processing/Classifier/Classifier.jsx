import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { generateDataProcessingPlotUuid } from 'utils/generateCustomPlotUuid';
import generateKneePlotSpec from 'utils/plotSpecs/generateClassifierKneePlot';
import generateEmptyDropsSpec from 'utils/plotSpecs/generateClassifierEmptyDropsPlot';
import FilterPlotLayout from 'components/data-processing/FilterPlotLayout';
import ClassifierConfig from './ClassifierConfig';

const filterName = 'classifier';

const Classifier = ({
  experimentId, sampleId, sampleIds, onConfigChange, stepDisabled, stepHadErrors,
}) => {
  const filterTableUuid = generateDataProcessingPlotUuid(sampleId, filterName, 2);

  const expConfig = useSelector(
    (state) => state.experimentSettings.processing[filterName][sampleId].filterSettings,
  );

  const getSpecGenerator = useCallback((generator) => (
    (config, plotData) => generator(config, expConfig, plotData)
  ), [expConfig]);

  const plots = {
    kneePlot: {
      title: 'Knee Plot',
      plotUuid: generateDataProcessingPlotUuid(sampleId, filterName, 1),
      plotType: 'classifierKneePlot',
      specGenerator: getSpecGenerator(generateKneePlotSpec),
    },
    emptyDropsPlot: {
      title: 'Empty Drops Plot',
      plotUuid: generateDataProcessingPlotUuid(sampleId, filterName, 0),
      plotType: 'classifierEmptyDropsPlot',
      specGenerator: getSpecGenerator(generateEmptyDropsSpec),
    },
  };

  const plotStylingControlsConfig = [
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

  const renderCalculationConfig = () => <ClassifierConfig />;

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

Classifier.propTypes = {
  experimentId: PropTypes.string.isRequired,
  sampleId: PropTypes.string.isRequired,
  sampleIds: PropTypes.array.isRequired,
  onConfigChange: PropTypes.func.isRequired,
  stepDisabled: PropTypes.bool,
  stepHadErrors: PropTypes.bool.isRequired,
};

Classifier.defaultProps = {
  stepDisabled: false,
};

export default Classifier;
