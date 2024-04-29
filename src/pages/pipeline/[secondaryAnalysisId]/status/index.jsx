/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback, useEffect, useState, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space, Switch, Popconfirm, Dropdown, Tooltip,
} from 'antd';
import _ from 'lodash';
import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';
import usePolling from 'utils/customHooks/usePolling';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadSecondaryAnalysisStatus, updateSecondaryAnalysis,
  cancelSecondaryAnalysis,
} from 'redux/actions/secondaryAnalyses';
import getReports from 'pages/pipeline/[secondaryAnalysisId]/status/getReports';
import PreloadContent from 'components/PreloadContent';
import { fastLoad } from 'components/Loader';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useAppRouter } from 'utils/AppRouteProvider';
import { modules } from 'utils/constants';
import writeToFileURL from 'utils/upload/writeToFileURL';
import {
  SECONDARY_ANALYSES_UPDATED,
} from 'redux/actionTypes/secondaryAnalyses';
import { DownOutlined, WarningOutlined } from '@ant-design/icons';

const AnalysisDetails = ({ secondaryAnalysisId }) => {
  const dispatch = useDispatch();

  const { navigateTo } = useAppRouter();

  const [reports, setReports] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const secondaryAnalysis = useSelector((state) => state.secondaryAnalyses[secondaryAnalysisId]);
  const associatedExperimentId = secondaryAnalysis?.experimentId;

  const loadAssociatedExperiment = async () => {
    const response = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}`);
    console.log('response   from get analysis info', response);
    dispatch({
      type: SECONDARY_ANALYSES_UPDATED,
      payload: {
        secondaryAnalysisId,
        secondaryAnalysis: { experimentId: response.experimentId },
      },
    });
  };

  const setupReports = useCallback(async () => {
    if (!associatedExperimentId) {
      await loadAssociatedExperiment();
    }

    const htmlUrls = await getReports(secondaryAnalysisId);

    // natural sort reports
    const sortedKeys = Object.keys(htmlUrls)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const sortedHtmlUrls = sortedKeys.reduce((obj, key) => {
      obj[key] = htmlUrls[key];
      return obj;
    }, {});

    setReports(sortedHtmlUrls);

    const defaultReport = 'all-sample_analysis_summary.html';
    const defaultReportKey = defaultReport in sortedHtmlUrls
      ? defaultReport
      : Object.keys(sortedHtmlUrls)[0];
    setSelectedReport(defaultReportKey);
  }, [secondaryAnalysisId]);

  useEffect(() => {
    if (secondaryAnalysis?.status.current !== 'finished') return;

    setupReports();
  }, [secondaryAnalysis?.status.current]);

  const secondaryAnalysisFinished = useMemo(() => (
    secondaryAnalysis?.status?.current === 'finished'
  ), [secondaryAnalysis?.status?.current]);

  const outputDownloadParams = useMemo(() => ({
    all: {
      uri: `/v2/secondaryAnalysis/${secondaryAnalysisId}/allOutputFiles`,
      fileName: 'all_files.zip',
    },
    combined: {
      uri: `/v2/secondaryAnalysis/${secondaryAnalysisId}/combinedOutput`,
      fileName: 'combined_output.zip',
    },
  }), [secondaryAnalysisId]);

  const downloadOutput = useCallback(async (type) => {
    const { uri, fileName } = outputDownloadParams[type];
    const signedUrl = await fetchAPI(uri);
    downloadFromUrl(signedUrl, fileName);
  }, [outputDownloadParams]);

  const downloadReports = useCallback(async () => {
    const logsResponse = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/logFile`, {}, { parseJson: false });
    const logsFile = await logsResponse.arrayBuffer();
    downloadFromUrl(writeToFileURL(logsFile), `${secondaryAnalysisId}.log`);
  }, [secondaryAnalysisId]);

  usePolling(async () => {
    if (!['running', 'created'].includes(secondaryAnalysis?.status?.current)) return;
    await dispatch(loadSecondaryAnalysisStatus(secondaryAnalysisId));
  }, [secondaryAnalysisId, secondaryAnalysis?.status?.current]);

  const menuItems = [
    {
      key: 'combined',
      onClick: (e) => {
        e.domEvent.stopPropagation();
        downloadOutput('combined');
      },
      label: (
        <Tooltip
          title='Download combined output files'
          placement='right'
          mouseEnterDelay={0.05}
        >
          <Space>
            Combined Output
          </Space>
        </Tooltip>
      ),
    },
    {
      key: 'reports',
      onClick: (e) => {
        e.domEvent.stopPropagation();
        downloadReports();
      },
      label: (
        <Tooltip
          title='Download report files'
          placement='right'
          mouseEnterDelay={0.05}
        >
          <Space>
            Reports
          </Space>
        </Tooltip>
      ),
    },
    {
      key: 'all',
      onClick: (e) => {
        e.domEvent.stopPropagation();
        downloadOutput('all');
      },
      label: (

        <Tooltip
          title={(
            <>
              <WarningOutlined />
              {' '}
              Warning: Downloading all output files might take a long time.
            </>
          )}
          placement='right'
          mouseEnterDelay={0.05}
          overlayStyle={{
            background: '#B6007C',
          }}
        >
          <Space>
            All files
          </Space>
        </Tooltip>
      ),
    },
  ];

  const renderDownloadOutputButton = () => (
    <Dropdown
      trigger={['click']}
      menu={{
        items: menuItems,
      }}
    >
      <Button type='primary' disabled={!secondaryAnalysisFinished}>
        Download Output
        <DownOutlined />
      </Button>
    </Dropdown>
  );

  const renderDownloadLogsButton = () => (
    <Button type='primary' onClick={() => downloadOutput('logs')}>
      Download Logs
      {' '}
      <DownOutlined />
      {' '}
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
          {renderDownloadLogsButton()}
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
        {associatedExperimentId && (
          <Button
            onClick={async () => {
              navigateTo(modules.DATA_EXPLORATION,
                { experimentId: associatedExperimentId }, false, true);
            }}
            type='primary'
          >
            Go to Insights downstream analysis
          </Button>
        )}
      </Space>
      <iframe src={URL.createObjectURL(reports[selectedReport])} title='My Document' style={{ height: '100%', width: '100%' }} />
    </>

  );
};

AnalysisDetails.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
