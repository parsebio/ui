/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space, Switch, Popconfirm,
} from 'antd';

import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';
import usePolling from 'utils/customHooks/usePolling';
import { useDispatch, useSelector } from 'react-redux';
import { loadSecondaryAnalysisStatus, updateSecondaryAnalysis, cancelSecondaryAnalysis } from 'redux/actions/secondaryAnalyses';
import getReports from 'pages/secondary-analysis/[secondaryAnalysisId]/status/getReports';
import PreloadContent from 'components/PreloadContent';
import { fastLoad } from 'components/Loader';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useAppRouter } from 'utils/AppRouteProvider';
import { modules } from 'utils/constants';
import writeToFileURL from 'utils/upload/writeToFileURL';

const AnalysisDetails = ({ secondaryAnalysisId }) => {
  const dispatch = useDispatch();

  const { navigateTo } = useAppRouter();

  const [reports, setReports] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const secondaryAnalysis = useSelector((state) => state.secondaryAnalyses[secondaryAnalysisId]);

  const setupReports = useCallback(async () => {
    const htmlUrls = await getReports(secondaryAnalysisId);

    setReports(htmlUrls);
    setSelectedReport(Object.keys(htmlUrls)[0]);
  }, [secondaryAnalysisId]);

  useEffect(() => {
    if (secondaryAnalysis?.status.current !== 'finished') return;

    setupReports();
  }, [secondaryAnalysis?.status.current]);

  const downloadOutput = useCallback(async () => {
    if (secondaryAnalysis?.status?.current === 'finished') {
      const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/output`);
      downloadFromUrl(signedUrl, 'all_outputs.zip');
    } else {
      const logsResponse = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/logFile`, {}, { parseJson: false });
      const logsFile = await logsResponse.arrayBuffer();
      downloadFromUrl(writeToFileURL(logsFile), `${secondaryAnalysisId}.log`);
    }
  }, [secondaryAnalysisId, secondaryAnalysis?.status?.current]);

  usePolling(async () => {
    if (!['running', 'created'].includes(secondaryAnalysis?.status?.current)) return;

    await dispatch(loadSecondaryAnalysisStatus(secondaryAnalysisId));
  }, [secondaryAnalysisId, secondaryAnalysis?.status?.current]);

  const renderDownloadOutputButton = () => (
    <Button type='primary' onClick={downloadOutput}>
      Download output
    </Button>
  );

  if (!secondaryAnalysis || secondaryAnalysis?.status.loading) {
    return <PreloadContent />;
  }

  if (secondaryAnalysis?.status.current !== 'finished') {
    const messages = {
      not_created: (
        <Space direction='vertical'>
          <Paragraph style={{ fontSize: '20px', width: '100%' }}>{'Analysis hasn\'t been executed yet'}</Paragraph>
          <Button size='large' type='primary' onClick={() => navigateTo(modules.SECONDARY_ANALYSIS)}>Take me to Pipelines</Button>
        </Space>
      ),
      cancelled: (
        <Space direction='vertical'>
          <Paragraph style={{ fontSize: '20px', width: '100%' }}>Your pipeline run has been cancelled.</Paragraph>
          <Button size='large' type='primary' onClick={() => navigateTo(modules.SECONDARY_ANALYSIS)}>Take me to Pipelines</Button>
        </Space>
      ),
      created: (
        <Space direction='vertical'>
          {fastLoad('')}
          <Paragraph style={{ fontSize: '20px', width: '100%' }}>
            The pipeline is launching
            .
            <br />
            You cannot change any settings until the run completes
          </Paragraph>
        </Space>
      ),
      failed: (
        <Space direction='vertical'>
          <Paragraph style={{ fontSize: '20px', width: '100%' }}>
            Your pipeline run failed.
            The error logs can be accessed by downloading the pipeline output files.

          </Paragraph>
          {renderDownloadOutputButton()}
        </Space>
      ),
      running: (
        <>
          <div>
            {fastLoad('')}
            <Paragraph style={{ fontSize: '20px', width: '50%' }}>
              The pipeline is running. You cannot change any settings until the run completes
              <br />
              <br />
              <br />
              To elect to receive an email notification when your
              pipeline run is complete, ensure the toggle below is enabled.
              <br />
            </Paragraph>
            <Switch
              checked={secondaryAnalysis.notifyByEmail}
              onChange={(value) => dispatch(
                updateSecondaryAnalysis(secondaryAnalysisId, { notifyByEmail: value }),
              )}
            />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Popconfirm
                title='Are you sure you want to cancel this pipeline run?'
                onConfirm={() => dispatch(cancelSecondaryAnalysis(secondaryAnalysisId))}
                okText='Yes'
                cancelText='No'
              >
                <Button type='danger'>Cancel Run</Button>
              </Popconfirm>
            </div>
          </div>
          <></>
        </>),
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
        {renderDownloadOutputButton()}
      </Space>

      <iframe src={URL.createObjectURL(reports[selectedReport])} title='My Document' style={{ height: '100%', width: '100%' }} />
    </>

  );
};

AnalysisDetails.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
