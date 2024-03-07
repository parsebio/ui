import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';

import fetchAPI from 'utils/http/fetchAPI';

const getHtmlsFromZip = async (fileBlob) => {
  const zipReader = new ZipReader(new BlobReader(fileBlob));
  const entries = await zipReader.getEntries();

  const htmlEntries = entries.filter(({ filename }) => filename.endsWith('.html'));
  const htmlsArray = await Promise.all(htmlEntries.map(async (entry) => (
    [entry.filename, await entry.getData(new TextWriter())]
  )));

  return Object.fromEntries(htmlsArray);
};

const getReports = async (analysisId) => {
  const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/reports`);

  const response = await fetch(signedUrl);
  const zip = await response.blob();

  return await getHtmlsFromZip(zip);
};

export default getReports;
