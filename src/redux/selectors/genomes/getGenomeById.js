import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getGenomeById = (genomeId) => (state) => (
  state.genomes?.custom[genomeId] ?? state.genomes?.public[genomeId]
);

export default createMemoizedSelector(getGenomeById);
