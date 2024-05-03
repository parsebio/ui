/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback, useEffect, useState, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space, Switch, Popconfirm, Dropdown, Tooltip, Typography, Card, Progress, Spin,
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
import { useAppRouter } from 'utils/AppRouteProvider';
import { modules } from 'utils/constants';
import writeToFileURL from 'utils/upload/writeToFileURL';
import {
  SECONDARY_ANALYSES_UPDATED,
} from 'redux/actionTypes/secondaryAnalyses';
import { DownOutlined, WarningOutlined } from '@ant-design/icons';
import PipelineLogsViewer from 'components/secondary-analysis/PipelineLogsViewer';

const { Text, Paragraph, Title } = Typography;

const AnalysisDetails = ({ secondaryAnalysisId }) => {
  const dispatch = useDispatch();

  const { navigateTo } = useAppRouter();

  const [reports, setReports] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const secondaryAnalysis = useSelector((state) => state.secondaryAnalyses[secondaryAnalysisId]);
  const associatedExperimentId = secondaryAnalysis?.experimentId;
  const progress = secondaryAnalysis?.status?.progress;

  const loadAssociatedExperiment = async () => {
    const response = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}`);
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
      // if you stay in the loading screen when the pipeline finishes
      // the associated experimentId doesnt get loaded unless you refresh the page
      // because that happens onNavigate and in that case the user is in the same page
      // so we need to load it manually
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
    summaries: {
      uri: `/v2/secondaryAnalysis/${secondaryAnalysisId}/reports`,
      fileName: 'all_summaries.zip',
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
        downloadOutput('summaries');
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
    <Button type='primary' onClick={() => downloadReports()}>
      Download Logs
      {' '}
      <DownOutlined />
      {' '}
    </Button>
  );

  if (!secondaryAnalysis?.status.current && secondaryAnalysis?.status.loading) {
    return <PreloadContent />;
  }
  const ProgressBar = () => {
    const { totalTasks } = secondaryAnalysis.status;
    const { running, succeeded } = progress;
    const succeededPercentage = _.round((succeeded / totalTasks) * 100);
    const runningPercentage = _.round((running / totalTasks) * 100);
    return (
      <div>
        <Tooltip title={`Tasks : ${succeeded} done / ${running} in progress / ${totalTasks - succeeded - running} not started`}>
          <Progress
            percent={succeededPercentage + runningPercentage}
            success={{ percent: succeededPercentage }}
            type='dashboard'
            showInfo={false}
          />
        </Tooltip>
      </div>
    );
  };

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
        <div>
          {fastLoad('')}
          <Title level={3}>The pipeline is launching... </Title>
          <Text type='secondary'>You can wait or leave this screen and check again later.</Text>
          <br />
          <Text type='secondary'>You cannot change any settings until the run completes.</Text>
          <br />
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
          <br />
          <br />
          <Space direction='horizontal'>
            <Text>Get notified about your pipeline status via email  </Text>
            <Switch
              checked={secondaryAnalysis.notifyByEmail}
              onChange={(value) => dispatch(
                updateSecondaryAnalysis(secondaryAnalysisId, { notifyByEmail: value }),
              )}
            />
          </Space>
        </div>
      ),
      failed: (
        <Space direction='horizontal'>

          <Space direction='vertical'>
            <Paragraph style={{ fontSize: '20px', width: '100%' }}>
              Your pipeline run failed.
              The error logs can be accessed by downloading the pipeline output files.

            </Paragraph>
            {renderDownloadLogsButton()}
          </Space>
          <div>
            <PipelineLogsViewer secondaryAnalysisId={secondaryAnalysisId} />
          </div>
        </Space>
      ),
      running: (
        <Card>
          <div style={{ display: 'block', justifyContent: 'center' }}>
            <div>
              <ProgressBar />
              <Title level={3}>
                The pipeline is running
                {' '}
                <Spin />
              </Title>
              <Text type='secondary'>You can wait or leave this screen and check again later.</Text>
              <br />
              <Text type='secondary'>You cannot change any settings until the run completes.</Text>
              <br />
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
              <br />
              <br />
              <Space direction='horizontal'>
                <Text>Get notified about your pipeline status via email  </Text>
                <Switch
                  checked={secondaryAnalysis.notifyByEmail}
                  onChange={(value) => dispatch(
                    updateSecondaryAnalysis(secondaryAnalysisId, { notifyByEmail: value }),
                  )}
                />
              </Space>
            </div>
            <div>
              <PipelineLogsViewer secondaryAnalysisId={secondaryAnalysisId} />
            </div>
          </div>
        </Card>
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
