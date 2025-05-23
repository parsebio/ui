import axios from 'axios';

const MAX_RETRIES = 5;

const second = 1000;
const baseDelay = 2 * second;

const backoff = async (currentRetry) => (
  new Promise((resolve) => { setTimeout(resolve, baseDelay * (2 ** currentRetry)); })
);

const putInS3 = async (
  blob,
  signedUrlGenerator,
  abortController,
  onUploadProgress,
  retryPolicy,
  currentRetry = 0,
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
    if (currentRetry <= MAX_RETRIES) {
      if (retryPolicy === 'exponentialBackoff') {
        // Exponential backoff, last attempt will be after waiting 64 seconds (2 seconds * 2 ** 5)
        await backoff(currentRetry);
      }

      return await putInS3(
        blob,
        signedUrlGenerator,
        abortController,
        onUploadProgress,
        retryPolicy,
        currentRetry + 1,
      );
    }

    throw e;
  }
};

export default putInS3;
