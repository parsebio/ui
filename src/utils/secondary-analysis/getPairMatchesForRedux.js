import { getSublibraryName } from 'utils/fastqUtils';

const getPairMatchesForRedux = (pairMatches, reduxFiles) => (
  pairMatches.reduce((acc, { wtFileR1Id, immuneFileR1Id }) => {
    const { name: wtFileR1Name } = reduxFiles.find(({ id }) => id === wtFileR1Id);
    const { name: immuneFileR1Name } = reduxFiles.find(({ id }) => id === immuneFileR1Id);

    const wtPairName = getSublibraryName(wtFileR1Name);
    const immunePairName = getSublibraryName(immuneFileR1Name);

    acc[getSublibraryName(immunePairName)] = wtPairName;

    return acc;
  }, {})
);

export default getPairMatchesForRedux;
