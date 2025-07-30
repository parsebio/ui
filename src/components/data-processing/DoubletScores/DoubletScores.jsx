import React from 'react';
import PropTypes from 'prop-types';
import { generateDataProcessingPlotUuid } from 'utils/generateCustomPlotUuid';

import FilterPlotLayout from 'components/data-processing/FilterPlotLayout';
import generateSpec from 'utils/plotSpecs/generateDoubletScoreHistogram';
import DoubletScoresConfig from 'components/data-processing/DoubletScores/DoubletScoresConfig';

const DoubletScores = ({
  experimentId, sampleId, sampleIds, onConfigChange, stepDisabled, stepHadErrors,
}) => {
  const filterName = 'doubletScores';
  const plotType = 'doubletScoreHistogram';
  const plotUuid = generateDataProcessingPlotUuid(sampleId, filterName, 0);
  const filterTableUuid = generateDataProcessingPlotUuid(sampleId, filterName, 1);

  const plots = {
    doubletScoreHistogram: {
      plotUuid,
      plotType,
      specGenerator: generateSpec,
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

  const renderCalculationConfig = () => <DoubletScoresConfig />;
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

DoubletScores.propTypes = {
  experimentId: PropTypes.string.isRequired,
  sampleId: PropTypes.string.isRequired,
  sampleIds: PropTypes.array.isRequired,
  onConfigChange: PropTypes.func.isRequired,
  stepDisabled: PropTypes.bool,
  stepHadErrors: PropTypes.bool.isRequired,
};

DoubletScores.defaultProps = {
  stepDisabled: false,
};

export default DoubletScores;
