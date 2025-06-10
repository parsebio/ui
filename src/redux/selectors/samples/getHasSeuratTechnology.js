import sampleTech from 'const/enums/sampleTech';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getHasSeuratTechnology = (experimentId) => (state) => {
  const sampleIds = state.experiments[experimentId]?.sampleIds || [];

  return sampleIds.some(
    (sampleId) => state.samples[sampleId]?.type === sampleTech.SEURAT,
  );
};

export default createMemoizedSelector(getHasSeuratTechnology);
