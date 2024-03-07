/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space,
} from 'antd';
import {
  BlobReader, TextWriter, ZipReader,
} from '@zip.js/zip.js';

import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';

const createUrlFromSrc = (htmlCode) => `data:text/html;charset=UTF-8,${encodeURIComponent(htmlCode)}`;

const getHtmlUrlsFromZip = async (fileBlob) => {
  const zipReader = new ZipReader(new BlobReader(fileBlob));
  const entries = await zipReader.getEntries();

  const htmlEntries = entries.filter(({ filename }) => filename.endsWith('.html'));
  const htmlsUrls = await Promise.all(htmlEntries.map(
    async (entry) => (
      [entry.filename, createUrlFromSrc(await entry.getData(new TextWriter()))]
    ),
  ));

  return Object.fromEntries(htmlsUrls);
};

const AnalysisDetails = ({ analysisId }) => {
  const [reportOptions, setReportOptions] = useState(null);

  const [selectedReport, setSelectedReport] = useState(null);

  const getReports = useCallback(async () => {
    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/reports`);

    const response = await fetch(signedUrl);
    const zip = await response.blob();
    const htmlUrls = await getHtmlUrlsFromZip(zip);

    setReportOptions(htmlUrls);
    setSelectedReport(Object.keys(htmlUrls)[0]);
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId) return;

    getReports();
  }, [analysisId]);

  const downloadAllOutputs = useCallback(async () => {
    if (!analysisId) return;

    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/output`);

    downloadFromUrl(signedUrl, 'all_outputs.zip');
  }, [analysisId]);

  if (selectedReport === null) return <></>;

  return (
    <>
      <Space style={{ marginTop: '5px', marginBottom: '5px', marginLeft: '20px' }}>
        <Select
          options={Object.entries(reportOptions).map(([reportName]) => (
            {
              label: reportName,
              value: reportName,
            }
          ))}
          value={selectedReport}
          placeholder='Select a report'
          onChange={setSelectedReport}
          style={{ width: '300px' }}
        />
        <Button type='primary' onClick={downloadAllOutputs}>
          Download all outputs
        </Button>
      </Space>

      <base target='_top' href='https://example.com/' />
      <iframe src={reportOptions[selectedReport]} title='My Document' style={{ height: '100%', width: '100%' }} />
    </>

  );
};

AnalysisDetails.propTypes = {
  analysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
