import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import { sampleTech } from 'utils/constants';

const getHasSeuratTechnology = (experimentId) => (state) => {
  const sampleIds = state.experiments[experimentId]?.sampleIds
  ?? state.experimentSettings.info.sampleIds ?? [];

  if (!sampleIds.length) return null;

  return sampleIds.some(
    (sampleId) => state.samples[sampleId]?.type === sampleTech.SEURAT,
  );
};

export default createMemoizedSelector(getHasSeuratTechnology);
