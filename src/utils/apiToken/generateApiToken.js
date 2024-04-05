import fetchAPI from '../http/fetchAPI';

const generateApiToken = async (replace) => (
  await fetchAPI('/v2/cliUpload/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ replace }),
  })
);

export default generateApiToken;
