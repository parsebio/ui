import axios from 'axios';

const MAX_RETRIES = 3;

const putInS3 = async (
  blob, signedUrlGenerator, abortController, onUploadProgress, currentRetry = 0,
) => {
  try {
    const signedUrl = await signedUrlGenerator();
    return await axios.request({
      method: 'put',
      data: blob,
      url: signedUrl,
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      onUploadProgress,
    });
  } catch (e) {
    if (currentRetry < MAX_RETRIES) {
      return await putInS3(
        blob, signedUrlGenerator, abortController, onUploadProgress, currentRetry + 1,
      );
    }

    throw e;
  }
};

export default putInS3;
