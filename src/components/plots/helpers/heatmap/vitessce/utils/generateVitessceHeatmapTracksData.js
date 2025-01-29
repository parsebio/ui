import { hexToRgb } from 'utils/plotUtils';

const generateVitessceHeatmapTracksData = (trackOrder, cellSets, cells) => {
  const cellIdsColorsMap = new Map();

  cells.forEach((cell) => {
    const allColorsForCell = trackOrder.map((cellClassKey) => {
      const cluster = cell.presentInClusters[cellClassKey][0];
      const { color } = cellSets.properties[cluster];
      return hexToRgb(color) ?? hexToRgb('#f5f8fa');
    });

    cellIdsColorsMap.set(`${cell.id}`, allColorsForCell);
  });

  return cellIdsColorsMap;
};

export default generateVitessceHeatmapTracksData;
