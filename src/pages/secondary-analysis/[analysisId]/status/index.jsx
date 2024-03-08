/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space, Typography,
} from 'antd';

import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';
import usePolling from 'utils/customHooks/usePolling';
import { useDispatch, useSelector } from 'react-redux';
import { loadSecondaryAnalysisStatus } from 'redux/actions/secondaryAnalyses';
import getReports from 'pages/secondary-analysis/[analysisId]/status/getReports';
import PreloadContent from 'components/PreloadContent';
import { fastLoad } from 'components/Loader';
import Paragraph from 'antd/lib/typography/Paragraph';
import Loader from 'react-spinners/BarLoader';

const { Text } = Typography;

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

  const renderDownloadAllOutputsButton = () => (
    <Button type='primary' onClick={downloadAllOutputs}>
      Download all outputs
    </Button>
  );

  if (secondaryAnalysis?.status.loading) {
    return <PreloadContent />;
  }

  if (secondaryAnalysis.status.current !== 'finished') {
    const messages = {
      not_created: <Paragraph style={{ fontSize: '20px', width: '100%' }}>{'Analysis hasn\'t been executed yet'}</Paragraph>,
      failed: (
        <Space direction='vertical'>
          <Paragraph style={{ fontSize: '20px', width: '100%' }}>
            Your pipeline run failed.
            The error logs can be accessed by downloading the pipeline output files.

          </Paragraph>
          {renderDownloadAllOutputsButton()}
        </Space>
      ),
      running: (
        <>
          {fastLoad('')}
          <Paragraph style={{ fontSize: '20px', width: '50%' }}>
            The pipeline is running. You cannot change any settings until the run completes
            <br />
            <br />
            <br />
            To elect to receive an email notification when your
            pipeline run is complete, ensure the toggle below is enabled.
          </Paragraph>
        </>
      ),
    };

    return (
      <center style={{ width: '100%', height: '100%' }}>
        <Space style={{ height: '100%' }}>
          {messages[secondaryAnalysis.status.current]}
        </Space>
      </center>
    );
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
        {renderDownloadAllOutputsButton()}
      </Space>

      <iframe src={null} srcDoc={reports[selectedReport]} title='My Document' style={{ height: '100%', width: '100%' }} />
    </>

  );
};

AnalysisDetails.propTypes = {
  analysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
