import FastqFileType from 'const/enums/FastqFileType';
import _ from 'lodash';

const rReadRegex = /_R([12])/;
const underscoreReadRegex = /_([12])\.(fastq|fq)\.gz$/;

const getReadNumber = (fileName) => {
  // Use the regexes to extract the read number from the file name
  const match = fileName.match(rReadRegex) || fileName.match(underscoreReadRegex);
  if (match) {
    return parseInt(match[1], 10); // Return the read number as an integer (1 or 2)
  }
  return null; // Return null if no match is found
};

const getMatchingPairFor = (fileName) => {
  const matcher = fileName.match(rReadRegex) ? rReadRegex : underscoreReadRegex;

  const matchingPair = fileName.replace(matcher, (match, group1) => {
    const otherNumber = group1 === '1' ? '2' : '1';

    return match.replace(group1, otherNumber);
  });

  return matchingPair;
};

const hasReadPair = (fileName) => (
  rReadRegex.test(fileName) || underscoreReadRegex.test(fileName)
);

const getPairs = (files) => {
  const distributedFiles = {
    [FastqFileType.IMMUNE_FASTQ]: {
      1: [],
      2: [],
    },
    [FastqFileType.WT_FASTQ]: {
      1: [],
      2: [],
    },
  };

  Object.values(files).forEach((file) => {
    if (file.type === 'samplelt') return;

    distributedFiles[file.type][getReadNumber(file.name)].push(file);
  });
};

// eslint-disable-next-line import/prefer-default-export
export { getPairs, getMatchingPairFor, hasReadPair };
