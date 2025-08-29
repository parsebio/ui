/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomesLoaded = produce((draft, action) => {
  const { genomes } = action.payload;
  genomes.forEach((genome) => {
    draft[genome.id] = genome;
  });
});

export default genomesLoaded;
