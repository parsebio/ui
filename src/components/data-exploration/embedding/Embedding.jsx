// eslint-disable-file import/no-extraneous-dependencies
import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';

import _ from 'lodash';

import {
  useSelector, useDispatch,
} from 'react-redux';
import PropTypes from 'prop-types';
import * as vega from 'vega';

import PlatformError from 'components/PlatformError';
import Loader from 'components/Loader';

import { getCellSets } from 'redux/selectors';

import { loadEmbedding } from 'redux/actions/embedding';
import { loadGeneExpression } from 'redux/actions/genes';
import { updateCellInfo } from 'redux/actions/cellInfo';
import { loadProcessingSettings } from 'redux/actions/experimentSettings';

import {
  convertCellsData,
  renderCellSetColors,
  colorByGeneExpression,
  colorInterpolator,
} from 'utils/plotUtils';

import dynamic from 'next/dynamic';
import EmbeddingTooltip from './EmbeddingTooltip';

const INITIAL_ZOOM = 4.00;
const cellRadiusFromZoom = (zoom) => zoom ** 3 / 50;
const originalView = { target: [4, -4, 0], zoom: INITIAL_ZOOM };

const Scatterplot = dynamic(
  () => import('../DynamicVitessceWrappers').then((mod) => mod.Scatterplot),
  { ssr: false },
);

const Embedding = (props) => {
  const {
    experimentId, height, width,
  } = props;

  const dispatch = useDispatch();

  const [cellRadius, setCellRadius] = useState(cellRadiusFromZoom(INITIAL_ZOOM));

  const embeddingSettings = useSelector(
    (state) => state.experimentSettings?.originalProcessing?.configureEmbedding?.embeddingSettings,
    _.isEqual,
  );
  const selectedCell = useSelector((state) => state.cellInfo.cellId);
  const embeddingType = embeddingSettings?.method;

  const { data, loading, error } = useSelector((state) => state.embeddings[embeddingType]) || {};

  const focusData = useSelector((state) => state.cellInfo.focus, _.isEqual);

  const cellSets = useSelector(getCellSets());
  const {
    properties: cellSetProperties,
    hierarchy: cellSetHierarchy,
    hidden: cellSetHidden,
  } = cellSets;

  const expressionLoading = useSelector((state) => state.genes.expression.full.loading);
  const expressionMatrix = useSelector((state) => state.genes.expression.full.matrix);

  const cellCoordinatesRef = useRef({ x: 200, y: 300 });

  const [createClusterPopover, setCreateClusterPopover] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [cellColors, setCellColors] = useState({});
  const [cellInfoVisible, setCellInfoVisible] = useState(true);

  const [view, setView] = useState(originalView);

  const showLoader = useMemo(() => {
    const dataIsLoaded = !data || loading;
    const geneLoadedIfNecessary = focusData.store === 'genes' && !expressionMatrix.geneIsLoaded(focusData.key);

    return dataIsLoaded || geneLoadedIfNecessary;
  });

  // Load embedding settings if they aren't already.
  useEffect(() => {
    if (!embeddingSettings) {
      dispatch(loadProcessingSettings(experimentId));
    }
  }, []);

  // Then, try to load the embedding with the appropriate data.
  useEffect(() => {
    if (embeddingSettings && !data) {
      dispatch(loadEmbedding(experimentId, embeddingType));
    }
  }, [embeddingSettings]);

  // Handle focus change (e.g. a cell set or gene or metadata got selected).
  // Also handle here when the cell set properties or hierarchy change.
  useEffect(() => {
    const { store, key } = focusData;

    switch (store) {
      // For genes/continous data, we cannot do this in one go,
      // we need to wait for the thing to load in first.
      case 'genes': {
        dispatch(loadGeneExpression(experimentId, [key], 'embedding'));
        setCellInfoVisible(false);
        return;
      }

      // Cell sets are easy, just return the appropriate color and set them up.
      case 'cellSets': {
        setCellColors(renderCellSetColors(key, cellSetHierarchy, cellSetProperties));
        setCellInfoVisible(false);
        return;
      }

      // If there is no focus, we can just delete all the colors.
      default: {
        setCellColors({});
        setCellInfoVisible(false);
        break;
      }
    }
  }, [focusData, cellSetHierarchy, cellSetProperties]);

  // Handle loading of expression for focused gene.
  useEffect(() => {
    if (!expressionMatrix.geneIsLoaded(focusData.key)) {
      return;
    }

    const truncatedExpression = expressionMatrix.getTruncatedExpression(focusData.key);
    const { truncatedMin, truncatedMax } = expressionMatrix.getStats(focusData.key);

    setCellColors(colorByGeneExpression(truncatedExpression, truncatedMin, truncatedMax));
  }, [focusData.key, expressionLoading]);

  const [convertedCellsData, setConvertedCellsData] = useState();

  useEffect(() => {
    if (!data || !cellSetHidden || !cellSetProperties) return;

    setConvertedCellsData(convertCellsData(data, cellSetHidden, cellSetProperties));
  }, [data, cellSetHidden, cellSetProperties]);

  const setCellHighlight = useCallback((cell) => {
    // Keep last shown tooltip
    if (!cell) return;

    dispatch(updateCellInfo({ cellId: cell }));
  }, []);

  const clearCellHighlight = useCallback(() => {
    dispatch(updateCellInfo({ cellId: null }));
  }, []);

  const updateViewInfo = useCallback((viewInfo) => {
    if (selectedCell && viewInfo.projectFromId) {
      const [x, y] = viewInfo.projectFromId(selectedCell);
      cellCoordinatesRef.current = {
        x,
        y,
        width,
        height,
      };
    }
  }, [selectedCell]);

  const setCellsSelection = useCallback((selection) => {
    if (Array.from(selection).length > 0) {
      setCreateClusterPopover(true);
      const selectedIdsToInt = new Set(Array.from(selection).map((id) => parseInt(id, 10)));
      setSelectedIds(selectedIdsToInt);
    }
  }, []);

  const cellColorsForVitessce = useMemo(() => new Map(Object.entries(cellColors)), [cellColors]);

  const setViewState = useCallback(({ zoom, target }) => {
    setCellRadius(cellRadiusFromZoom(zoom));

    setView({ zoom, target });
  }, []);

  const getExpressionValue = useCallback(() => { }, []);
  const getCellIsSelected = useCallback(() => { }, []);

  // The embedding couldn't load. Display an error condition.
  if (error) {
    return (
      <PlatformError
        error={error}
        onClick={() => dispatch(loadEmbedding(experimentId, embeddingType))}
      />
    );
  }

  const renderExpressionView = () => {
    if (focusData.store === 'genes') {
      const colorScale = vega.scale('sequential')()
        .interpolator(colorInterpolator);

      return (
        <div>
          <label htmlFor='continuous data name'>
            <strong>{focusData.key}</strong>
          </label>
          <div
            style={{
              position: 'absolute',
              background: `linear-gradient(${colorScale(1)}, ${colorScale(0)})`,
              height: 200,
              width: 20,
              top: 70,
            }}
          />
        </div>
      );
    }

    if (focusData.store === 'cellSets') {
      return (
        <div>
          <label htmlFor='cell set name'>
            <strong>{cellSetProperties[focusData.key] ? cellSetProperties[focusData.key].name : ''}</strong>
          </label>
        </div>
      );
    }

    return <div />;
  };

  return (
    <>
      {showLoader && <center><Loader experimentId={experimentId} size='large' /></center>}
      <div
        className='vitessce-container vitessce-theme-light'
        style={{
          width,
          height,
          position: 'relative',
          display: showLoader ? 'none' : 'block',
        }}
        // make sure that the crosshairs don't break zooming in and out of the embedding
        onWheel={() => { setCellInfoVisible(false); }}
        onMouseMove={() => {
          if (!cellInfoVisible) {
            setCellInfoVisible(true);
          }
        }}
        onMouseLeave={clearCellHighlight}
        onClick={clearCellHighlight}
        onKeyPress={clearCellHighlight}
      >
        {renderExpressionView()}
        {
          <Scatterplot
            cellColorEncoding='cellSetSelection'
            cellOpacity={0.8}
            cellRadius={cellRadius}
            setCellHighlight={setCellHighlight}
            theme='light'
            uuid={embeddingType}
            viewState={view}
            setViewState={setViewState}
            originalViewState={originalView}
            updateViewInfo={updateViewInfo}
            obsEmbedding={convertedCellsData?.obsEmbedding}
            obsEmbeddingIndex={convertedCellsData?.obsEmbeddingIndex}
            cellColors={cellColorsForVitessce}
            setCellSelection={setCellsSelection}
            getExpressionValue={getExpressionValue}
            getCellIsSelected={getCellIsSelected}
          />
        }
        <EmbeddingTooltip
          experimentId={experimentId}
          cellCoordinatesRef={cellCoordinatesRef}
          selectedIds={selectedIds}
          width={width}
          height={height}
          cellInfoVisible={cellInfoVisible}
          embeddingType={embeddingType}
          createClusterPopover={createClusterPopover}
          setCreateClusterPopover={setCreateClusterPopover}
        />
      </div>
    </>
  );
};

Embedding.defaultProps = {};

Embedding.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  experimentId: PropTypes.string.isRequired,
};
export default Embedding;
