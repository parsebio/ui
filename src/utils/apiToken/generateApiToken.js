import fetchAPI from '../http/fetchAPI';

const generateApiToken = async () => (
  await fetchAPI('/v2/cliUpload/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
);

export default generateApiToken;
