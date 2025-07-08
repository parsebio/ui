const kitOptions = [
  { label: 'Evercode WT Mini', value: 'wt_mini' },
  { label: 'Evercode WT', value: 'wt' },
  { label: 'Evercode WT Mega', value: 'wt_mega' },
  { label: 'Evercode WT Mega 384', value: 'wt_mega_384' },
  // { label: 'Evercode TCR Mini', value: 'tcr_mini' },
  // { label: 'Evercode TCR', value: 'tcr' },
  // { label: 'Evercode TCR Mega', value: 'tcr_mega' },
  // { label: 'Evercode BCR Mini', value: 'bcr_mini' },
  // { label: 'Evercode BCR', value: 'bcr' },
  // { label: 'Evercode BCR Mega', value: 'bcr_mega' },
];

const kitCategories = {
  TCR: 'tcr',
  BCR: 'bcr',
  WT: 'wt',
};

const isKitCategory = (kit, category) => {
  if (!kit) {
    return false;
  }
  if (kit.startsWith(category)) {
    return true;
  }
};

export default kitOptions;
export { isKitCategory, kitCategories };
