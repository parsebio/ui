import React, {
  useState, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { generateDataProcessingPlotUuid } from 'utils/generateCustomPlotUuid';

import FilterPlotLayout from 'components/data-processing/FilterPlotLayout';
import kneePlotSpecGenerator from 'utils/plotSpecs/generateCellSizeDistributionKneePlot';
import generateHistogramSpec from 'utils/plotSpecs/generateCellSizeDistributionHistogram';
import CellSizeDistributionConfig from 'components/data-processing/CellSizeDistribution/CellSizeDistributionConfig';

const HIGHEST_UMI_DEFAULT = 17000;
const filterName = 'cellSizeDistribution';

const CellSizeDistribution = ({
  experimentId, sampleId, sampleIds, onConfigChange, stepDisabled, stepHadErrors,
}) => {
  const [highestUmi, setHighestUmi] = useState(null);
  const filterTableUuid = generateDataProcessingPlotUuid(sampleId, filterName, 3);

  const histogramPlotData = useSelector(
    (state) => state.componentConfig[
      generateDataProcessingPlotUuid(sampleId, filterName, 1)]?.plotData,
  );

  useEffect(() => {
    setHighestUmi(_.maxBy(
      histogramPlotData,
      (datum) => datum.u,
    )?.u ?? HIGHEST_UMI_DEFAULT);
  }, [histogramPlotData]);

  const getHistogramSpecGenerator = useCallback(() => (
    (config, plotData) => generateHistogramSpec(config, plotData, highestUmi)
  ), [highestUmi]);

  const plots = {
    kneePlot: {
      title: 'Knee Plot',
      plotUuid: generateDataProcessingPlotUuid(sampleId, filterName, 0),
      plotType: 'cellSizeDistributionKneePlot',
      specGenerator: kneePlotSpecGenerator,
    },
    histogram: {
      title: 'Histogram',
      plotUuid: generateDataProcessingPlotUuid(sampleId, filterName, 1),
      plotType: 'cellSizeDistributionHistogram',
      specGenerator: getHistogramSpecGenerator(),
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
    }];

  const renderCalculationConfig = () => (
    <CellSizeDistributionConfig highestUmi={highestUmi} />);
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

CellSizeDistribution.propTypes = {
  experimentId: PropTypes.string.isRequired,
  sampleId: PropTypes.string.isRequired,
  sampleIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onConfigChange: PropTypes.func.isRequired,
  stepDisabled: PropTypes.bool,
  stepHadErrors: PropTypes.bool.isRequired,
};

CellSizeDistribution.defaultProps = {
  stepDisabled: false,
};

export default CellSizeDistribution;
