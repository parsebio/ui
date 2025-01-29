import generateVitessceHeatmapExpressionsMatrix from 'components/plots/helpers/heatmap/vitessce/utils/generateVitessceHeatmapExpressionsMatrix';
import generateVitessceHeatmapTracksData from 'components/plots/helpers/heatmap/vitessce/utils/generateVitessceHeatmapTracksData';

const generateVitessceData = (
  cellOrder, selectedTracks,
  expressionMatrix, selectedGenes, cellSets,
) => {
  const trackColorData = generateVitessceHeatmapTracksData(
    selectedTracks, cellSets, cellOrder,
  );
  const cellIdsOrder = cellOrder.map(({ id }) => id);
  const vitessceMatrix = generateVitessceHeatmapExpressionsMatrix(
    cellIdsOrder,
    selectedGenes,
    expressionMatrix,
  );

  const metadataTracksLabels = selectedTracks
    .map((cellClassKey) => cellSets.properties[cellClassKey].name);

  return {
    expressionMatrix: {
      cols: selectedGenes,
      rows: cellIdsOrder.map((x) => `${x}`),
      matrix: Uint8Array.from(vitessceMatrix),
    },
    metadataTracks: {
      dataPoints: trackColorData,
      labels: metadataTracksLabels,
    },
  };
};

export default generateVitessceData;
