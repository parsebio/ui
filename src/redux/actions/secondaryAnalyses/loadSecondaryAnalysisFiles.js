import pushNotificationMessage from 'utils/pushNotificationMessage';

const loadSecondaryAnalysisFiles = (secondaryAnalysisId) => async () => {
  try {
    const response = await fetch(`v2/secondary-analyses/${secondaryAnalysisId}/files`);

    if (!response.ok) {
      throw new Error('Error loading secondary analysis files');
    }
  } catch (e) {
    pushNotificationMessage('error', 'We could not load the secondary analysis files for this run.');
    console.log(e);
  }
};

export default loadSecondaryAnalysisFiles;
