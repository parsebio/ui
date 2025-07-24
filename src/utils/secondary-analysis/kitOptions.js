import FastqFileType from 'const/enums/FastqFileType';

// A lot of pieces of code rely on cehcking startsWith against the values
// (for example, the KitCategory.fromKit function).
// So be careful if changing them.
// Migrate to explicit "includes" checks if this begins causing issues.
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

export default kitOptions;
export { labelsByFastqType };
