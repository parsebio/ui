/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Button, Select, Space, Switch, Popconfirm, Dropdown, Tooltip, Typography, Card, Progress, Spin,
  Divider,
} from 'antd';
import _ from 'lodash';
import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';
import usePolling from 'utils/customHooks/usePolling';
import { useDispatch, useSelector } from 'react-redux';
import pushNotificationMessage from 'utils/pushNotificationMessage';

import {
  loadSecondaryAnalysisStatus, updateSecondaryAnalysis,
  cancelSecondaryAnalysis,
} from 'redux/actions/secondaryAnalyses';
import getReports from 'pages/pipeline/[secondaryAnalysisId]/status/getReports';
import PreloadContent from 'components/PreloadContent';
import { fastLoad } from 'components/Loader';
import { useAppRouter } from 'utils/AppRouteProvider';
import { modules } from 'const';
import writeToFileURL from 'utils/upload/writeToFileURL';
import {
  SECONDARY_ANALYSES_UPDATED,
} from 'redux/actionTypes/secondaryAnalyses';
import { DownOutlined } from '@ant-design/icons';
import PipelineLogsViewer from 'components/secondary-analysis/PipelineLogsViewer';

const { Text, Paragraph, Title } = Typography;

// eslint-disable-next-line react/prop-types
const ProgressBar = ({ totalTasks, running, succeeded }) => {
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

const AnalysisDetails = ({ secondaryAnalysisId }) => {
  const dispatch = useDispatch();

  const { navigateTo } = useAppRouter();

  const [reports, setReports] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [downloadOptionsMenuItems, setDownloadOptionsMenuItems] = useState(null);

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

  const getSignedUrl = async (type) => {
    const fileName = encodeURIComponent(type);
    return await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/getOutputDownloadLink?fileKey=${fileName}`);
  };

  const downloadOutput = useCallback(async (type) => {
    const signedUrl = await getSignedUrl(type);
    downloadFromUrl(signedUrl);
  }, [secondaryAnalysisId]);

  const downloadLogs = useCallback(async () => {
    const logsResponse = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/logFile`, {}, { parseJson: false });
    const logsFile = await logsResponse.arrayBuffer();
    downloadFromUrl(writeToFileURL(logsFile), { fileName: `${secondaryAnalysisId}.log` });
  }, [secondaryAnalysisId]);

  const setupReports = useCallback(async () => {
    if (!associatedExperimentId) {
      // if you stay in the loading screen when the pipeline finishes
      // the associated experimentId doesnt get loaded unless you refresh the page
      // because that happens onNavigate and in that case the user is in the same page
      // so we need to load it manually
      await loadAssociatedExperiment();
    }

    const outputOptions = await fetchAPI(
      `/v2/secondaryAnalysis/${secondaryAnalysisId}/getOutputDownloadOptions`,
    );
    console.log('OUTPUT OPTIONS', outputOptions);
    const makeOptionItem = (opt) => {
      const label = (
        <Tooltip title={opt.description} placement='left' mouseEnterDelay={0.05}>
          <Space>{opt.label}</Space>
        </Tooltip>
      );

      if (opt.copySignedUrl) {
        return {
          label,
          key: opt.key,
          children: [
            {
              label: 'Download',
              key: `${opt.key}-download`,
              onClick: () => downloadOutput(opt.key),
            },
            {
              label: 'Copy resumable download command',
              key: `${opt.key}-copy`,
              onClick: async () => {
                const signedUrl = await getSignedUrl(opt.key);
                navigator.clipboard.writeText(
                  `curl -C - -o ${secondaryAnalysisId}_${opt.key} "${signedUrl}"`,
                );
                pushNotificationMessage('success', 'Resumable download command copied.');
              },
            },
          ],
        };
      }

      return {
        label,
        key: opt.key,
        onClick: () => downloadOutput(opt.key),
      };
    };

    const subMenus = Object.keys(outputOptions);
    const menuItems = subMenus.length === 1
      ? outputOptions[subMenus[0]].map(makeOptionItem)
      : subMenus.map((category) => ({
        label: category,
        key: category,
        children: outputOptions[category].map(makeOptionItem),
      }));

    setDownloadOptionsMenuItems(menuItems);

    const htmlUrls = await getReports(secondaryAnalysisId);

    // natural sort reports
    const sortedKeys = Object.keys(htmlUrls)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const sortedHtmlUrls = sortedKeys.reduce((obj, key) => {
      // eslint-disable-next-line no-param-reassign
      obj[key] = htmlUrls[key];
      return obj;
    }, {});

    setReports(sortedHtmlUrls);

    const defaultReport = 'all-sample_analysis_summary.html';
    const defaultReportKey = defaultReport in sortedHtmlUrls
      ? defaultReport
      : Object.keys(sortedHtmlUrls)[0];
    setSelectedReport(defaultReportKey);
  }, [secondaryAnalysisId, associatedExperimentId, secondaryAnalysis]);

  useEffect(() => {
    if (secondaryAnalysis?.status.current !== 'finished') return;

    setupReports();
  }, [secondaryAnalysis?.status.current]);

  usePolling(async () => {
    if (!['running', 'created'].includes(secondaryAnalysis?.status?.current)) return;
    await dispatch(loadSecondaryAnalysisStatus(secondaryAnalysisId));
  }, [secondaryAnalysisId, secondaryAnalysis?.status?.current]);

  const renderDownloadOutputButton = () => (
    <Dropdown
      trigger={['click']}
      menu={{
        items: downloadOptionsMenuItems,
      }}
    >
      <Button type='primary' disabled={!downloadOptionsMenuItems}>
        Download Output
        <DownOutlined />
      </Button>
    </Dropdown>
  );

  const renderDownloadLogsButton = () => (
    <Button type='primary' onClick={() => downloadLogs()}>
      Download Logs
      {' '}
      <DownOutlined />
      {' '}
    </Button>
  );

  if ((!secondaryAnalysis?.status.current && secondaryAnalysis?.status.loading)
    || !secondaryAnalysis) {
    return <PreloadContent />;
  }

  if (secondaryAnalysis?.status.current !== 'finished') {
    const messages = {
      not_created: (
        <Space direction='vertical'>
          <Paragraph style={{ fontSize: '20px', width: '100%' }}>{'Analysis hasn\'t been executed yet'}</Paragraph>
          <Button size='large' type='primary' onClick={() => navigateTo(modules.SECONDARY_ANALYSIS)}>Take me to Pipeline</Button>
        </Space>
      ),
      cancelled: (
        <Space direction='vertical'>
          <Title level={3}>Your pipeline run has been cancelled.</Title>
          <Button size='large' type='primary' onClick={() => navigateTo(modules.SECONDARY_ANALYSIS)}>Take me to Pipeline</Button>
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
              onChange={(notifyByEmail) => dispatch(
                updateSecondaryAnalysis(secondaryAnalysisId, { notifyByEmail }),
              )}
            />
          </Space>
        </div>
      ),
      failed: (
        <Card>
          <div style={{ display: 'block', justifyContent: 'center' }}>
            <Space direction='vertical'>
              <Title level={3}>
                Your pipeline run failed.
              </Title>
              <Text type='secondary'>
                The error logs can be accessed by downloading the pipeline output files.
              </Text>
              {renderDownloadLogsButton()}
              <br />
              <div style={{ textAlign: 'left' }}>
                <Text type='secondary' style={{ marginTop: '8px' }}>
                  For help addressing your pipeline failure, visit our article
                  {' '}
                  <br />
                  <a href='https://support.parsebiosciences.com/hc/en-us/articles/31579430276372-How-to-troubleshoot-Pipeline-failures-in-Trailmaker' target='_blank' rel='noopener noreferrer'>
                    How to troubleshoot pipeline failures in Trailmaker
                  </a>
                  .
                </Text>
              </div>
              <div style={{ textAlign: 'left' }}>
                <Text type='secondary' style={{ marginTop: '8px' }}>
                  To access the article, make sure you are logged into the support suite
                  <br />
                  using your Parse Biosciences account.
                </Text>
              </div>
              <div style={{ textAlign: 'left' }}>
                <Text type='secondary' style={{ marginTop: '8px' }}>
                  If your error message is not covered in the article or you need further support,
                  <br />
                  contact us at
                  {' '}
                  <a href='mailto:support@parsebiosciences.com'>support@parsebiosciences.com</a>
                  .
                </Text>
              </div>
            </Space>
            <div>
              <PipelineLogsViewer secondaryAnalysisId={secondaryAnalysisId} />
            </div>
          </div>
        </Card>
      ),
      running: (
        <Card>
          <div style={{ display: 'block', justifyContent: 'center' }}>
            <div>
              <ProgressBar
                totalTasks={secondaryAnalysis.status.totalTasks}
                running={progress.running}
                succeeded={progress.succeeded}
              />
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

  return (
    <>
      <Space style={{ marginTop: '5px', marginBottom: '5px', marginLeft: '20px' }}>
        {reports ? (
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
        ) : <Select disabled placeholder='Getting reports...' style={{ width: '300px' }} />}

        {renderDownloadOutputButton()}
        {associatedExperimentId && (
          <Tooltip title={secondaryAnalysis.status.pairMatchesIds?.length > 0
            ? 'Trailmaker Insights module does not currently support immune profiling data analysis. Only the WT outputs from this Run are available in the Insights module for downstream analysis and visualization.'
            : null}
          >
            <Button
              onClick={async () => {
                navigateTo(
                  modules.DATA_PROCESSING,
                  { experimentId: associatedExperimentId },
                  false,
                  true,
                );
              }}
              type='primary'
            >
              Go to Insights downstream analysis
            </Button>
          </Tooltip>
        )}
      </Space>
      <Divider style={{ width: '100%', margin: '0' }} />
      {
        reports ? (
          <iframe src={URL.createObjectURL(reports[selectedReport])} title='My Document' style={{ height: '100%', width: '100%' }} />
        ) : (
          fastLoad('Getting reports...')
        )
      }
    </>
  );
};

AnalysisDetails.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
