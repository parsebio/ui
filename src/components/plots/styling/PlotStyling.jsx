/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import {
  Collapse,
} from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import TitleDesign from './TitleDesign';
import FontDesign from './FontDesign';
import LegendEditor from './LegendEditor';
import LabelsDesign from './LabelsDesign';
import DimensionsRangeEditor from './DimensionsRangeEditor';
import AxesDesign from './AxesDesign';
import AxesWithRangesDesign from './AxesWithRangesDesign';
import PointDesign from './PointDesign';
import ColourbarDesign from './ColourbarDesign';
import ColourInversion from './ColourInversion';
import ExpressionValuesType from './ExpressionValuesType';
import ExpressionValuesCapping from './ExpressionValuesCapping';

import ViolinMarkersEditor from './violin/MarkersEditor';

import VolcanoThresholdsGuidesEditor from './volcano/ThresholdsGuidesEditor';
import VolcanoMarkersEditor from './volcano/MarkersEditor';
import VolcanoDisplayLabels from './volcano/DisplayLabels';

const { Panel } = Collapse;

const ComponentMapping = {
  dimensions: (attr, config, onUpdate) => <DimensionsRangeEditor key='dimensions' config={config} onUpdate={onUpdate} {...attr} />,
  title: (attr, config, onUpdate) => <TitleDesign key='title' config={config} onUpdate={onUpdate} {...attr} />,
  font: (attr, config, onUpdate) => <FontDesign key='font' config={config} onUpdate={onUpdate} {...attr} />,
  axes: (attr, config, onUpdate) => <AxesDesign key='axes' config={config} onUpdate={onUpdate} {...attr} />,
  axesWithRanges: (attr, config, onUpdate) => <AxesWithRangesDesign key='axesWithRanges' config={config} onUpdate={onUpdate} {...attr} />,
  colourScheme: (attr, config, onUpdate) => <ColourbarDesign key='colourScheme' config={config} onUpdate={onUpdate} {...attr} />,
  colourInversion: (attr, config, onUpdate) => <ColourInversion key='colourInversion' config={config} onUpdate={onUpdate} {...attr} />,
  expressionValuesType: (attr, config, onUpdate) => <ExpressionValuesType key='expressionValuesType' config={config} onUpdate={onUpdate} {...attr} />,
  expressionValuesCapping: (attr, config, onUpdate) => <ExpressionValuesCapping key='expressionValuesCapping' config={config} onUpdate={onUpdate} {...attr} />,
  markers: (attr, config, onUpdate) => <PointDesign key='markers' config={config} onUpdate={onUpdate} {...attr} />,
  legend: (attr, config, onUpdate) => <LegendEditor key='legend' onUpdate={onUpdate} config={config} {...attr} />,
  labels: (attr, config, onUpdate) => <LabelsDesign key='labels' onUpdate={onUpdate} config={config} {...attr} />,
  violinMarkers: (attr, config, onUpdate) => <ViolinMarkersEditor key='violinMarkers' config={config} onUpdate={onUpdate} {...attr} />,
  volcanoThresholds: (attr, config, onUpdate) => <VolcanoThresholdsGuidesEditor key='volcanoThresholds' config={config} onUpdate={onUpdate} {...attr} />,
  volcanoMarkers: (attr, config, onUpdate) => <VolcanoMarkersEditor key='volcanoMarkers' config={config} onUpdate={onUpdate} {...attr} />,
  volcanoLabels: (attr, config, onUpdate) => <VolcanoDisplayLabels key='volcanoLabels' config={config} onUpdate={onUpdate} {...attr} />,
};

const PlotStyling = (props) => {
  const {
    formConfig, config, onUpdate, extraPanels, defaultActiveKey,
  } = props;

  const formatPanelKey = (key) => key.trim().toLowerCase().replace(' ', '-');

  const buildForm = (configObj) => configObj.map((el) => {
    // Build component object from component

    if (Object.getOwnPropertyDescriptor(el, 'controls') && el.controls.length > 0) {
      return (

        <Panel
          header={el.panelTitle}
          key={formatPanelKey(el.panelTitle)}
        >
          {el.header}
          {el.controls.map((control) => {
            // If control is a string, no prop is passed
            if (_.isString(control)) {
              return ComponentMapping[control]({}, config, onUpdate);
            }

            return ComponentMapping[control.name](control.props || {}, config, onUpdate);
          })}

          {
            Object.getOwnPropertyDescriptor(el, 'children')
              && el.children.length > 0
              ? (
                <Collapse>
                  {buildForm(el.children)}
                </Collapse>
              )
              : ''
          }

          {el.footer}
        </Panel>
      );
    }
    return null;
  });

  return (
    <Collapse defaultActiveKey={defaultActiveKey} accordion>
      {extraPanels}
      {buildForm(formConfig)}
    </Collapse>
  );
};

PlotStyling.propTypes = {
  formConfig: PropTypes.array,
  config: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  extraPanels: PropTypes.node,
  defaultActiveKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
};

PlotStyling.defaultProps = {
  formConfig: [],
  config: {},
  extraPanels: null,
  defaultActiveKey: [],
};

export default PlotStyling;
