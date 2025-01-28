/* eslint-disable react/prop-types */
import React, {
  useState,
} from 'react';

import ClusterPopover from 'components/data-exploration/embedding/ClusterPopover';
import { useDispatch } from 'react-redux';
import { createCellSet } from 'redux/actions/cellSets';
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
    cellInfoTooltip,
    embeddingType,
    createClusterPopover,
    setCreateClusterPopover,
  } = props;

  const dispatch = useDispatch();

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
