import React from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Skeleton } from 'antd';
import BasicFilterPlot from 'components/plots/BasicFilterPlot';

const getMiniaturizedConfig = (config) => {
  const miniatureConfig = {
    legend: {
      enabled: false,
    },
    axes: {
      titleFontSize: 1,
      labelFontSize: 1,
    },
    dimensions: {
      width: 92,
      height: 92,
    },
    title: {},
    marker: {
      size: 1,
    },
    labels: {
      enabled: false,
    },
  };

  const miniPlotConfig = _.cloneDeep(config);
  _.assign(miniPlotConfig, miniatureConfig);

  if (miniPlotConfig.signals) { miniPlotConfig.signals[0].bind = undefined; }

  miniPlotConfig.miniPlot = true;

  return miniPlotConfig;
};

const MiniPlot = (props) => {
  const {
    plotUuid, specGenerator, actions,
  } = props;

  const { config, plotData } = useSelector(
    (state) => state.componentConfig[plotUuid] || {},
  );

  const renderPlot = () => {
    if (!config) {
      return (
        <center>
          <Skeleton.Image style={{ width: 92, height: 92 }} />
        </center>
      );
    }

    return (
      <BasicFilterPlot
        spec={specGenerator(getMiniaturizedConfig(config), plotData || [])}
        actions={actions}
        // We might be able to improve a bit on this part
        miniPlot
      />
    );
  };

  return (
    renderPlot()
  );
};

MiniPlot.propTypes = {
  experimentId: PropTypes.string.isRequired,
  plotUuid: PropTypes.string.isRequired,
  specGenerator: PropTypes.func.isRequired,
  actions: PropTypes.bool.isRequired,
};

export default React.memo(MiniPlot);
