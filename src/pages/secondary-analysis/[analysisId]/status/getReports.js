import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';

import fetchAPI from 'utils/http/fetchAPI';

const createUrlFromSrc = (htmlCode) => `data:text/html;charset=UTF-8,${encodeURIComponent(htmlCode)}`;

const getHtmlUrlsFromZip = async (fileBlob) => {
  const zipReader = new ZipReader(new BlobReader(fileBlob));
  const entries = await zipReader.getEntries();

  const htmlEntries = entries.filter(({ filename }) => filename.endsWith('.html'));
  const htmlUrls = await Promise.all(htmlEntries.map(
    async (entry) => (
      [entry.filename, createUrlFromSrc(await entry.getData(new TextWriter()))]
    ),
  ));

  return Object.fromEntries(htmlUrls);
};

const getReports = async (analysisId) => {
  const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/reports`);

  const response = await fetch(signedUrl);
  const zip = await response.blob();

  return await getHtmlUrlsFromZip(zip);
};

export default getReports;
