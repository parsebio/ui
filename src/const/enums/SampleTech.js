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

const metadataValuesByTechnology = {
  [SampleTech.PARSE]: 'Parse Evercode WT',
  [SampleTech['10X']]: '10X Chromium',
  [SampleTech.RHAPSODY]: 'BD Rhapsody',
  [SampleTech.SEURAT]: 'Seurat',
  [SampleTech.H5]: '10X Chromium - H5',
};

const getTechNameToDisplay = (tech) => techNamesToDisplay[tech];
const getSampleTechMetadataValue = (tech) => metadataValuesByTechnology[tech];

export default SampleTech;
export { getTechNameToDisplay, getSampleTechMetadataValue };
