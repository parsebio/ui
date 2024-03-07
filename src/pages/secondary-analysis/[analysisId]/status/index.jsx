/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space,
} from 'antd';

import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';
import usePolling from 'utils/customHooks/usePolling';
import { useDispatch } from 'react-redux';
import { loadSecondaryAnalysisStatus } from 'redux/actions/secondaryAnalyses';
import getReports from 'pages/secondary-analysis/[analysisId]/status/getReports';

const AnalysisDetails = ({ analysisId }) => {
  const dispatch = useDispatch();

  const [reportOptions, setReportOptions] = useState(null);

  const [selectedReport, setSelectedReport] = useState(null);

  const setupReports = useCallback(async () => {
    const htmls = await getReports();

    setReportOptions(htmls);
    setSelectedReport(Object.keys(htmls)[0]);
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId) return;

    setupReports();
  }, [analysisId]);

  const downloadAllOutputs = useCallback(async () => {
    if (!analysisId) return;

    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/output`);

    downloadFromUrl(signedUrl, 'all_outputs.zip');
  }, [analysisId]);

  usePolling(async () => {
    await dispatch(loadSecondaryAnalysisStatus(analysisId));
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

      <iframe src={null} srcDoc={reportOptions[selectedReport]} title='My Document' style={{ height: '100%', width: '100%' }} />
    </>

  );
};

AnalysisDetails.propTypes = {
  analysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
