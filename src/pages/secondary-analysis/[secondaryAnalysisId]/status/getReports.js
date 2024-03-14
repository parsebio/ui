import {
  BlobReader, BlobWriter, ZipReader,
} from '@zip.js/zip.js';

import fetchAPI from 'utils/http/fetchAPI';

const getHtmlUrlsFromZip = async (fileBlob) => {
  const zipReader = new ZipReader(new BlobReader(fileBlob));
  const entries = await zipReader.getEntries();

  const htmlEntries = entries.filter(({ filename }) => filename.endsWith('.html'));
  const htmlUrls = await Promise.all(htmlEntries.map(
    async (entry) => {
      // Read blob
      let blob = await entry.getData(new BlobWriter());

      // Set its 'type' property to 'text/html'
      // Otherwise, Object.CreateObjectURL will read it as a string instead of an html
      // And instead of rendering a report, it renders the report's code
      blob = blob.slice(0, blob.size, 'text/html');

      return [entry.filename, blob];
    },
  ));

  return Object.fromEntries(htmlUrls);
};

const getReports = async (secondaryAnalysisId) => {
  const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/reports`);

  const response = await fetch(signedUrl);
  const zip = await response.blob();

  return await getHtmlUrlsFromZip(zip);
};

export default getReports;
