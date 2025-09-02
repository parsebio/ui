/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomesLoaded = produce((draft, action) => {
  const { genomes } = action.payload;

  Object.entries(genomes).forEach(([type, genomeList]) => {
    genomeList.forEach((genome) => {
      draft[type][genome.id] = genome;
    });
  });
});

export default genomesLoaded;
