/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space,
} from 'antd';

import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';
import usePolling from 'utils/customHooks/usePolling';
import { useDispatch, useSelector } from 'react-redux';
import { loadSecondaryAnalysisStatus } from 'redux/actions/secondaryAnalyses';
import getReports from 'pages/secondary-analysis/[analysisId]/status/getReports';
import PreloadContent from 'components/PreloadContent';
import { fastLoad } from 'components/Loader';

const AnalysisDetails = ({ analysisId }) => {
  const dispatch = useDispatch();

  const [reports, setReports] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const secondaryAnalysis = useSelector((state) => state.secondaryAnalyses[analysisId]);

  const setupReports = useCallback(async () => {
    const htmls = await getReports(analysisId);

    setReports(htmls);
    setSelectedReport(Object.keys(htmls)[0]);
  }, [analysisId]);

  useEffect(() => {
    if (secondaryAnalysis.status.current !== 'finished') return;

    setupReports();
  }, [secondaryAnalysis.status.current]);

  const downloadAllOutputs = useCallback(async () => {
    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/output`);

    downloadFromUrl(signedUrl, 'all_outputs.zip');
  }, [analysisId]);

  usePolling(async () => {
    await dispatch(loadSecondaryAnalysisStatus(analysisId));
  }, [analysisId]);

  if (secondaryAnalysis?.status.loading) {
    return <PreloadContent />;
  }

  if (secondaryAnalysis.status.current === 'not_created') {
    return "Analysis hasn't been created yet";
  }

  if (secondaryAnalysis.status.current === 'running') {
    return 'Analysis still running';
  }

  if (reports === null) {
    return fastLoad('Getting reports...');
  }

  return (
    <>
      <Space style={{ marginTop: '5px', marginBottom: '5px', marginLeft: '20px' }}>
        <Select
          options={Object.entries(reports).map(([reportName]) => (
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

      <iframe src={null} srcDoc={reports[selectedReport]} title='My Document' style={{ height: '100%', width: '100%' }} />
    </>

  );
};

AnalysisDetails.propTypes = {
  analysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
