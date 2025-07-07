import FastqFileType from 'const/enums/FastqFileType';

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

const getSublibraryName = (fileName) => {
  // Remove the read part (_R1, _R2, _1, _2) and the .fastq/.fq.gz extension from the file name
  let name = fileName;
  name = name.replace(rReadRegex, ''); // Remove _R1 or _R2
  name = name.replace(underscoreReadRegex, ''); // Remove _1.fastq.gz, _2.fq.gz, etc.
  name = name.replace(/\.(fastq|fq)\.gz$/, ''); // Remove .fastq.gz or .fq.gz if still present
  return name;
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
const getPairs = (files) => {
  const sublibraries = {
    [FastqFileType.IMMUNE_FASTQ]: {},
    [FastqFileType.WT_FASTQ]: {},
  };

  Object.values(files).forEach((file) => {
    if (file.type === 'samplelt') return;

    const pairName = getSublibraryName(file.name);

    const pairData = sublibraries[file.type][pairName] ||= [];

    pairData.push(file.id);
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
export { getPairs, getMatchingPairFor, hasReadPair };
