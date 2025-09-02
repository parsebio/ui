import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import getGenomeById from './getGenomeById';

const getSelectedGenome = (secondaryAnalysisId = null) => (state) => {
  const selectedSecondaryAnalysisId = secondaryAnalysisId
  ?? state.secondaryAnalyses.meta.activeSecondaryAnalysisId;

  const genomeId = state.secondaryAnalyses[selectedSecondaryAnalysisId]?.refGenome;
  return getGenomeById(genomeId)(state);
};

export default createMemoizedSelector(getSelectedGenome);
