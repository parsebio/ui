import fetchAPI from 'utils/http/fetchAPI';
import httpStatusCodes from 'utils/http/httpStatusCodes';

const getApiTokenExists = async () => {
  try {
    await fetchAPI('/v2/cliUpload/token', { method: 'HEAD' }, { parseJson: false });

    return true;
  } catch (e) {
    if (e.statusCode === httpStatusCodes.NOT_FOUND) {
      return false;
    }

    throw e;
  }
};

export default getApiTokenExists;
