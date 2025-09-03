import React, { useState, useEffect } from 'react';
import { Vega } from 'react-vega';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { generateSpec } from 'utils/plotSpecs/generateElbowSpec';
import { loadPlotConfig } from 'redux/actions/componentConfig';
import { useDispatch, useSelector } from 'react-redux';
import EmptyPlot from './helpers/EmptyPlot';

const ElbowPlot = (props) => {
  const {
    experimentId, config, plotUuid, plotType, actions, numPCs,
  } = props;

  const dispatch = useDispatch();

  const [plotSpec, setPlotSpec] = useState(null);

  const plotData = useSelector(
    (state) => state.componentConfig[plotUuid]?.plotData,
  );

  useEffect(() => {
    if (config && plotData && numPCs) {
      setPlotSpec(generateSpec(config, plotData, numPCs));
    }
  }, [config, plotData, numPCs]);

  useEffect(() => {
    if (_.isEmpty(plotData)) {
      dispatch(loadPlotConfig(experimentId, plotUuid, plotType));
    }
  }, [plotData]);

  if (!plotSpec) {
    return (
      <EmptyPlot mini={config.miniPlot} />
    );
  }

  return (
    <center>
      <Vega data={{ plotData }} spec={plotSpec} renderer='canvas' actions={actions} />
    </center>
  );
};

ElbowPlot.propTypes = {
  experimentId: PropTypes.string.isRequired,
  plotUuid: PropTypes.string.isRequired,
  plotType: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  actions: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  numPCs: PropTypes.number,
};

ElbowPlot.defaultProps = {
  actions: true,
  numPCs: 30,
};

export default ElbowPlot;
