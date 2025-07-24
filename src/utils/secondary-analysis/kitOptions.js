import FastqFileType from 'const/enums/FastqFileType';

const kitOptions = [
  { label: 'Evercode WT Mini', value: 'wt_mini' },
  { label: 'Evercode WT', value: 'wt' },
  { label: 'Evercode WT Mega', value: 'wt_mega' },
  { label: 'Evercode WT Mega 384', value: 'wt_mega_384' },
  // { label: 'Evercode TCR Mini', value: 'tcr_mini' },
  { label: 'Evercode TCR', value: 'tcr' },
  // { label: 'Evercode TCR Mega', value: 'tcr_mega' },
  // { label: 'Evercode BCR Mini', value: 'bcr_mini' },
  { label: 'Evercode BCR', value: 'bcr' },
  // { label: 'Evercode BCR Mega', value: 'bcr_mega' },
];

const labelsByFastqType = {
  [FastqFileType.WT_FASTQ]: 'WT',
  [FastqFileType.IMMUNE_FASTQ]: 'Immune',
};

const kitCategories = {
  TCR: 'tcr',
  BCR: 'bcr',
  WT: 'wt',
};

const immuneDbOptionsByKitCategory = {
  [kitCategories.BCR]: ['human', 'mouse', 'transgenic_mouse'],
  [kitCategories.TCR]: ['human', 'mouse'],
  [kitCategories.WT]: [],
};

const isKitCategory = (kit, categoryInput) => {
  if (!kit) return false;

  if (Array.isArray(categoryInput)) {
    return categoryInput.some((category) => kit.startsWith(category));
  }
  return kit.startsWith(categoryInput);
};

const getKitCategory = (kit) => {
  if (kit.startsWith(kitCategories.TCR)) {
    return kitCategories.TCR;
  }
  if (kit.startsWith(kitCategories.BCR)) {
    return kitCategories.BCR;
  }
  if (kit.startsWith(kitCategories.WT)) {
    return kitCategories.WT;
  }

  throw new Error(`Unknown kit: ${kit}`);
};

export default kitOptions;
export {
  isKitCategory, getKitCategory, kitCategories, labelsByFastqType, immuneDbOptionsByKitCategory,
};
