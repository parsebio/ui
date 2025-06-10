import sampleTech from 'const/enums/SampleTech';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getHasSeuratTechnology = (experimentId) => (state) => {
  const sampleIds = state.experiments[experimentId]?.sampleIds || [];

  return sampleIds.some(
    (sampleId) => state.samples[sampleId]?.type === sampleTech.SEURAT,
  );
};

export default createMemoizedSelector(getHasSeuratTechnology);
