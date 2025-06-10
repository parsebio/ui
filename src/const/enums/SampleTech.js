class SampleTech {
  constructor({
    value,
    displayName,
  }) {
    this.value = value;
    this.displayName = displayName;
  }

  toString() {
    return this.value;
  }
}

export const PARSE = new SampleTech({
  value: 'parse',
  displayName: `Parse Evercode${String.fromCharCode(8482)} WT`,
});

export const TENX = new SampleTech({
  value: '10x',
  displayName: `10X Chromium${String.fromCharCode(8482)}`,
});

export const RHAPSODY = new SampleTech({
  value: 'rhapsody',
  displayName: `BD Rhapsody${String.fromCharCode(8482)}`,
});

export const SEURAT = new SampleTech({
  value: 'seurat',
  displayName: 'Seurat',
});

export const H5 = new SampleTech({
  value: '10x_h5',
  displayName: `10X Chromium${String.fromCharCode(8482)} - H5`,
});


const SampleTechEnum = {
  PARSE,
  TENX,
  RHAPSODY,
  SEURAT,
  H5,
};

export default SampleTechEnum;
