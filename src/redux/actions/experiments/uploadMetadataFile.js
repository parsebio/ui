import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import { loadSamples } from '../samples';
import loadExperiments from './loadExperiments';

// replace whitespaces in second value (key) with underscores
const withCleanWhitespaceKeys = (data) => (
  data.split('\n').map((line) => {
    const [sampleName, key, value] = line.trim().split('\t');
    return `${sampleName}\t${key.replace(' ', '_')}\t${value}`;
  }).join('\n')
);

const uploadMetadataFile = (experimentId, data) => async (dispatch) => {
  const formattedData = withCleanWhitespaceKeys(data);

  try {
    await fetchAPI(
      `/v2/experiments/${experimentId}/metadataTracks`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: formattedData,
      },
    );

    // refresh experiment & samples info to show new metadata
    await dispatch(loadExperiments());
    await dispatch(loadSamples(experimentId));
  } catch (e) {
    handleError(e, e.userMessage);
  }
};

export default uploadMetadataFile;
