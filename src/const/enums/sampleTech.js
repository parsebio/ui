class SampleTech {
  static PARSE = 'parse';

  static ['10X'] = '10x';

  static RHAPSODY = 'rhapsody';

  static SEURAT = 'seurat';

  static H5 = '10x_h5';

  static displayNames = {
    [SampleTech.PARSE]: `Parse Evercode${String.fromCharCode(8482)} WT`,
    [SampleTech['10X']]: `10X Chromium${String.fromCharCode(8482)}`,
    [SampleTech.RHAPSODY]: `BD Rhapsody${String.fromCharCode(8482)}`,
    [SampleTech.SEURAT]: 'Seurat',
    [SampleTech.H5]: `10X Chromium${String.fromCharCode(8482)} - H5`,
  };

  static getDisplayName(value) {
    return SampleTech.displayNames[value] || value;
  }
}

export default SampleTech;
