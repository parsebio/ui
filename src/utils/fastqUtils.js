import FastqFileType from 'const/enums/FastqFileType';

const rReadRegex = /_R([12])/;
const underscoreReadRegex = /_([12])\.(fastq|fq)\.gz$/;

const getSublibraryData = (fileName) => {
  // Remove the read part (_R1, _R2, _1, _2) and the .fastq/.fq.gz extension from the file name
  let name = fileName;

  // Extract the read number (1 or 2) from _R1 or _R2
  const rReadMatch = name.match(rReadRegex);
  const [, readNumber] = rReadMatch;
  name = name.replace(rReadRegex, ''); // Remove _R1 or _R2

  // readNumber is available here if needed
  name = name.replace(underscoreReadRegex, ''); // Remove _1.fastq.gz, _2.fq.gz, etc.
  name = name.replace(/\.(fastq|fq)\.gz$/, ''); // Remove .fastq.gz or .fq.gz if still present
  return { name, readNumber };
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

    const { name: pairName, readNumber } = getSublibraryData(file.name);

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

// eslint-disable-next-line import/prefer-default-export
export {
  getPairsForFiles, getMatchingPairFor, hasReadPair, getSublibraryData,
};
