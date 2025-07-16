import FastqFileType from 'const/enums/FastqFileType';

const rReadRegex = /_R([12])/;
const underscoreReadRegex = /_([12])\.(fastq|fq)\.gz$/;

const getPairData = (fileName) => {
  let name = fileName;

  const rReadMatch = name.match(rReadRegex);
  const [, readNumberStr] = rReadMatch;
  name = name.replace(rReadRegex, '');

  name = name.replace(underscoreReadRegex, '');
  name = name.replace(/\.(fastq|fq)\.gz$/, '');
  return { name, readNumber: parseInt(readNumberStr, 10) };
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

// This function assumes that the files are already paired correctly,
// no checks are done on that end
const getPairsForFiles = (files) => {
  const sublibraries = {
    [FastqFileType.IMMUNE_FASTQ]: {},
    [FastqFileType.WT_FASTQ]: {},
  };

  Object.values(files).forEach((file) => {
    if (file.type === 'samplelt') return;

    const { name: pairName, readNumber } = getPairData(file.name);

    const pairData = sublibraries[file.type][pairName] ||= [null, null];

    // reads are 1 or 2, we want to store them in the array at index 0 or 1
    pairData[readNumber - 1] = file.id;
  });

  // Validate that every array in sublibraries' values has length 2
  Object.values(sublibraries).forEach((typeObj) => {
    Object.values(typeObj).forEach((filesArr) => {
      if (filesArr.length !== 2) {
        throw new Error('Invalid number of files per sulibrary');
      }
    });
  });

  return sublibraries;
};

export {
  getPairsForFiles, getMatchingPairFor, hasReadPair, getPairData,
};
