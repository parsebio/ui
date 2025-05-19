import _ from 'lodash';
import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const SAMPLE_LOADING_TABLE = 'samplelt';

const getSampleLTFile = (secondaryAnalysisId) => (state) => {
  const files = _.pickBy(
    state[secondaryAnalysisId]?.files.data,
    (file) => file.type === SAMPLE_LOADING_TABLE,
  );

  // Single file to return, so just return it
  return Object.values(files)[0];
};

export default createMemoizedSelector(getSampleLTFile);
