import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import { loadProcessingSettings } from 'redux/actions/experimentSettings';

import CellSetsTool from 'components/data-exploration/cell-sets-tool/CellSetsTool';
import GeneListTool from 'components/data-exploration/gene-list-tool/GeneListTool';
import DiffExprManager from 'components/data-exploration/differential-expression-tool/DiffExprManager';
import Embedding from 'components/data-exploration/embedding/Embedding';
import HeatmapPlot, { COMPONENT_TYPE } from 'components/data-exploration/heatmap/HeatmapPlot';
import HeatmapSettings from 'components/data-exploration/heatmap/HeatmapSettings';
import MosaicCloseButton from 'components/MosaicCloseButton';
import { updateLayout } from 'redux/actions/layout/index';

import 'react-mosaic-component/react-mosaic-component.css';
import MultiTileContainer from 'components/MultiTileContainer';
import { loadGeneExpression } from 'redux/actions/genes';
import getHighestDispersionGenes from 'utils/getHighestDispersionGenes';

const ExplorationViewPage = ({ experimentId }) => {
  const dispatch = useDispatch();
  const layout = useSelector((state) => state.layout);
  const { windows, panel } = layout;
  const [selectedTab, setSelectedTab] = useState(panel);

  const { method } = useSelector((state) => (
    state.experimentSettings.processing?.configureEmbedding?.embeddingSettings
  )) || false;
  const geneData = useSelector((state) => state.genes.properties.data);
  useEffect(() => {
    setSelectedTab(panel);
  }, [panel]);

  useEffect(() => {
    if (!method) {
      dispatch(loadProcessingSettings(experimentId));
    }
  }, []);

  useEffect(() => {
    if (!Object.keys(geneData)) return;
    const genesToLoad = getHighestDispersionGenes(geneData, 1);
    dispatch(loadGeneExpression(experimentId, genesToLoad, 'embedding'));
  }, [geneData]);

  const methodUppercase = method ? method.toUpperCase() : ' ';

  useEffect(() => {
    if (method && windows) {
      dispatch(updateLayout({
        ...windows,
        first: {
          ...windows.first,
          first: {
            ...windows.first.first,
            first: methodUppercase,
          },
        },
      }));
    }
  }, [method]);

  const TILE_MAP = {
    [methodUppercase]: {
      toolbarControls: <MosaicCloseButton key='remove-button-embedding' />,
      component: (width, height) => (
        <Embedding
          experimentId={experimentId}
          width={width}
          height={height}
        />
      ),
    },
    Heatmap: {
      toolbarControls: (
        <>
          <HeatmapSettings componentType={COMPONENT_TYPE} key='heatmap-settings' />
          <MosaicCloseButton key='remove-button-heatmap' />
        </>
      ),
      component: (width, height) => (
        <HeatmapPlot experimentId={experimentId} width={width} height={height} />
      ),
    },
    Genes: {
      toolbarControls: <MosaicCloseButton key='remove-button-genes' />,
      component: (width, height) => (
        <Tabs
          size='small'
          activeKey={selectedTab}
          onChange={(key) => { setSelectedTab(key); }}
          items={[{
            label: 'Gene list',
            key: 'Gene list',
            children: <GeneListTool experimentId={experimentId} width={width} height={height} />,
          }, {
            label: 'Differential expression',
            key: 'Differential expression',
            children: <DiffExprManager
              experimentId={experimentId}
              view='compute'
              width={width}
              height={height}
            />,
          }]}
        />
      ),
    },
    'Cell sets and Metadata': {
      toolbarControls: <MosaicCloseButton key='remove-button-data-management' />,
      component: (width, height) => (
        <CellSetsTool
          experimentId={experimentId}
          width={width}
          height={height}
        />
      ),
    },
  };

  return (
    <>
      <MultiTileContainer
        tileMap={TILE_MAP}
        initialArrangement={windows}
      />
    </>
  );
};

ExplorationViewPage.propTypes = {
  experimentId: PropTypes.string.isRequired,
};

export default ExplorationViewPage;
