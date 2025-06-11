const SampleTech = {
  PARSE: 'parse',
  '10X': '10x',
  RHAPSODY: 'rhapsody',
  SEURAT: 'seurat',
  H5: '10x_h5',
};

const techNamesToDisplay = {
  [SampleTech['10X']]: `10X Chromium${String.fromCharCode(8482)}`,
  [SampleTech.RHAPSODY]: `BD Rhapsody${String.fromCharCode(8482)}`,
  [SampleTech.SEURAT]: 'Seurat',
  [SampleTech.H5]: `10X Chromium${String.fromCharCode(8482)} - H5`,
  [SampleTech.PARSE]: `Parse Evercode${String.fromCharCode(8482)} WT`,
};

const getTechNameToDisplay = (tech) => techNamesToDisplay[tech];

// techOptions

export default SampleTech;
export { getTechNameToDisplay };
