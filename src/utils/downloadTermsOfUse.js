import fetchAPI from './http/fetchAPI';

const downloadTermsOfUse = async (setDataUseBlob, retries = 3) => {
  try {
    const signedUrl = await fetchAPI('/v2/termsOfUse/dataUse/download');
    const response = await fetch(signedUrl);

    let blob = await response.blob();
    blob = blob.slice(0, blob.size, 'text/html');

    setDataUseBlob(blob);
  } catch (e) {
    if (retries > 0) {
      console.error(`Retrying downloadTermsOfUse, attempts remaining: ${retries - 1}`);
      await new Promise((resolve) => { setTimeout(resolve, 2000); });
      return downloadTermsOfUse(setDataUseBlob, retries - 1);
    }
  }
};

export default downloadTermsOfUse;
