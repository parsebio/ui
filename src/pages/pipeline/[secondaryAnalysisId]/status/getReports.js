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

const getReports = async (secondaryAnalysisId, reportsFolder, retries = 3) => {
  try {
    const fileName = encodeURIComponent(`${reportsFolder}/${reportsFolder}_combined/all_summaries.zip`);
    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/getOutputDownloadLink?fileKey=${fileName}`);

    const response = await fetch(signedUrl);
    const zip = await response.blob();

    return await getHtmlUrlsFromZip(zip);
  } catch (error) {
    if (retries > 0) {
      console.error(`Retrying getReports, attempts remaining: ${retries - 1}`);
      await new Promise((resolve) => { setTimeout(resolve, 2000); });
      return getReports(secondaryAnalysisId, retries - 1);
    }
    throw new Error(`Failed to get reports after multiple attempts: ${error.message}`);
  }
};

export default getReports;
