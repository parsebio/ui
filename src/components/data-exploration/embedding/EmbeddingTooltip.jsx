/* eslint-disable react/prop-types */
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getCellSets, getCellSetsHierarchyByType } from 'redux/selectors';

import { createCellSet } from 'redux/actions/cellSets';

import ClusterPopover from 'components/data-exploration/embedding/ClusterPopover';
import getContainingCellSetsProperties from 'utils/cellSets/getContainingCellSetsProperties';
import CellInfo from '../CellInfo';
import CrossHair from './CrossHair';

const EmbeddingTooltip = (props) => {
  const {
    experimentId,
    cellCoordinatesRef,
    selectedIds,
    width,
    height,
    cellInfoVisible,
    embeddingType,
    createClusterPopover,
    setCreateClusterPopover,
  } = props;

  const dispatch = useDispatch();

  const focusData = useSelector((state) => state.cellInfo.focus);
  const selectedCell = useSelector((state) => state.cellInfo.cellId);
  const expressionMatrix = useSelector((state) => state.genes.expression.full.matrix);
  const cellSets = useSelector(getCellSets());
  const rootClusterNodes = useSelector(getCellSetsHierarchyByType('cellSets')).map(({ key }) => key);

  const [cellInfoTooltip, setCellInfoTooltip] = useState();

  const { properties: cellSetProperties } = cellSets;

  useEffect(() => {
    // Move this into the cell info tooltip component
    if (selectedCell) {
      let expressionToDispatch;
      let geneName;

      console.log('HOALHOLA');
      if (expressionMatrix.geneIsLoaded(focusData.key)) {
        geneName = focusData.key;

        const [expression] = expressionMatrix.getRawExpression(
          focusData.key,
          [parseInt(selectedCell, 10)],
        );

        expressionToDispatch = expression;
      }

      // getting the cluster properties for every cluster that has the cellId
      const cellProperties = getContainingCellSetsProperties(
        Number.parseInt(selectedCell, 10),
        rootClusterNodes,
        cellSets,
      );

      const prefixedCellSetNames = [];
      Object.values(cellProperties).forEach((clusterProperties) => {
        clusterProperties.forEach(({ name, parentNodeKey }) => {
          prefixedCellSetNames.push(`${cellSetProperties[parentNodeKey].name} : ${name}`);
        });
      });

      setCellInfoTooltip({
        cellSets: prefixedCellSetNames,
        cellId: selectedCell,
        componentType: embeddingType,
        expression: expressionToDispatch,
        geneName,
      });
    } else {
      setCellInfoTooltip(null);
    }
  }, [selectedCell]);

  const onCreateCluster = (clusterName, clusterColor) => {
    setCreateClusterPopover(false);
    dispatch(
      createCellSet(
        experimentId,
        clusterName,
        clusterColor,
        selectedIds,
      ),
    );
  };

  return (
    createClusterPopover ? (
      <ClusterPopover
        visible
        popoverPosition={cellCoordinatesRef}
        onCreate={onCreateCluster}
        onCancel={() => setCreateClusterPopover(false)}
      />
    ) : (
      (cellInfoVisible && cellInfoTooltip) ? (
        <div>
          <CellInfo
            containerWidth={width}
            containerHeight={height}
            componentType={embeddingType}
            coordinates={cellCoordinatesRef.current}
            cellInfo={cellInfoTooltip}
          />
          <CrossHair
            componentType={embeddingType}
            coordinates={cellCoordinatesRef}
          />
        </div>
      ) : <></>
    )
  );
};

export default EmbeddingTooltip;
