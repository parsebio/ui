import _ from 'lodash';

/* eslint-disable react/no-this-in-sfc */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useEffect, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';

import {
  BuildOutlined,
  FundViewOutlined,
  BarChartOutlined,
  NodeExpandOutlined,
  FileDoneOutlined,
  DotChartOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Typography,
  Divider,
} from 'antd';

import pipelineErrorUserMessages from 'utils/pipelineErrorUserMessages';
import TermsOfUseIntercept from 'components/data-management/TermsOfUseIntercept';

import BrowserAlert from 'components/BrowserAlert';
import PreloadContent from 'components/PreloadContent';
import GEM2SLoadingScreen from 'components/GEM2SLoadingScreen';
import PipelineRedirectToDataProcessing from 'components/PipelineRedirectToDataProcessing';

import { getBackendStatus, getHasSeuratTechnology } from 'redux/selectors';
import { loadUser } from 'redux/actions/user';
import { loadBackendStatus } from 'redux/actions/backendStatus';

import { isBrowser } from 'utils/deploymentInfo';
import { modules, brandColors } from 'const';
import { useAppRouter } from 'utils/AppRouteProvider';
import experimentUpdatesHandler from 'utils/experimentUpdatesHandler';
import integrationTestConstants from 'utils/integrationTestConstants';
import pipelineStatusValues from 'utils/pipelineStatusValues';

import { loadSamples } from 'redux/actions/samples';
import calculatePipelinesRerunStatus from 'utils/data-management/calculatePipelinesRerunStatus';

import termsOfUseNotAccepted from 'utils/termsOfUseNotAccepted';
import SidebarTitle from 'utils/SidebarTitle';

import CookieBanner from 'components/banners/CookieBanner';
import FeedbackButton from 'components/sider/FeedbackButton';
import ReferralButton from 'components/sider/ReferralButton';
import UserButton from 'components/sider/UserButton';
import NonParseBanner from './banners/NonParseBanner';

const { Sider } = Layout;
const { Text } = Typography;
const { Item, SubMenu, ItemGroup } = Menu;

const checkEveryIsValue = (arr, value) => arr.every((item) => item === value);

const backendErrors = [
  pipelineStatusValues.FAILED,
  pipelineStatusValues.TIMED_OUT,
  pipelineStatusValues.ABORTED,
];

const BigLogo = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: `linear-gradient(315deg, ${brandColors.DARK_LILAC} 0%, ${brandColors.INDIGO} 30%, ${brandColors.DARK_INDIGO} 100%)`,
      paddingTop: '10px',
      paddingBottom: '10px',
      pointerEvents: 'none',
      userSelect: 'none',
    }}
  >
    <svg xmlns='http://www.w3.org/2000/svg' width={200} height={50}>
      <defs id='svg_document_defs'>
        <style id='M Plus 2_Google_Webfont_import'>@import url(https://fonts.googleapis.com/css2?family=M+PLUS+2:wght@100..900&display=swap);</style>
      </defs>
      <g transform='translate(20, 25)'>

        {/* provided by? TBD */}
        <image href='/Parse_icon_white.png' x='-5' y='-20' width='18%' />
        <text
          style={{ outlineStyle: 'none' }}
          fontWeight='900'
          textRendering='geometricPrecision'
          fontFamily='M Plus 2'
          fill='#F0F2F5'
          fontSize='22.00px'
          textAnchor='start'
          dominantBaseline='middle'
          x='35'
        >
          Trailmaker
        </text>
      </g>
    </svg>
  </div>
);

const SmallLogo = () => (
  <div
    style={{
      background: `linear-gradient(315deg, ${brandColors.DARK_LILAC} 0%, ${brandColors.INDIGO} 30%, ${brandColors.DARK_INDIGO} 100%)`,
      paddingTop: '8px',
      paddingBottom: '8px',
      pointerEvents: 'none',
      userSelect: 'none',
    }}
  >
    <svg xmlns='http://www.w3.org/2000/svg' width={100} height={30}>
      <defs id='svg_document_defs'>
        <style id='M Plus 2_Google_Webfont_import'>@import url(https://fonts.googleapis.com/css2?family=M+PLUS+2:wght@100..900&display=swap);</style>
      </defs>
      <g>
        <image href='/Parse_icon_white.png' x='20' y='0' width='35%' />
      </g>
    </svg>
  </div>
);

const ContentWrapper = (props) => {
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);

  const {
    routeExperimentId, routeAnalysisId, experimentData, children,
  } = props;

  const { navigateTo, currentModule } = useAppRouter();

  const currentExperimentIdRef = useRef(routeExperimentId);
  const currentAnalysisIdRef = useRef(routeAnalysisId);
  const selectedExperimentID = useSelector((state) => state?.experiments?.meta?.activeExperimentId);
  const selectedAnalysisID = useSelector(
    (state) => state?.secondaryAnalyses?.meta?.activeSecondaryAnalysisId,
  );

  const domainName = useSelector((state) => state.networkResources.domainName);
  const user = useSelector((state) => state.user.current);

  const samples = useSelector((state) => state.samples);
  useEffect(() => {
    // selectedExperimentID holds the value in redux of the selected experiment
    // after loading a page it is determined whether to use that ID or the ID in the route URL
    // i.e. when we are in data management there is not exp ID in the URL so we get it from redux
    if (!selectedExperimentID && !routeExperimentId) return;

    if (currentModule === modules.DATA_MANAGEMENT) {
      currentExperimentIdRef.current = selectedExperimentID;
      return;
    }

    if (currentExperimentIdRef.current === routeExperimentId) return;

    currentExperimentIdRef.current = routeExperimentId;
  }, [currentModule, selectedExperimentID, routeExperimentId]);

  useEffect(() => {
    if (currentModule === modules.SECONDARY_ANALYSIS) {
      currentAnalysisIdRef.current = selectedAnalysisID;
    } else if (currentModule === modules.SECONDARY_ANALYSIS_OUTPUT) {
      currentAnalysisIdRef.current = routeAnalysisId;
    }
  }, [currentModule, selectedAnalysisID]);

  const currentExperimentId = currentExperimentIdRef.current;
  const experiment = useSelector((state) => state?.experiments[currentExperimentId]);

  const hasSeuratTechnology = useSelector(getHasSeuratTechnology(currentExperimentId));

  const experimentName = experimentData?.experimentName || experiment?.name;
  const secondaryAnalysisName = useSelector(
    (state) => state?.secondaryAnalyses?.[currentAnalysisIdRef.current]?.name,
    _.isEqual,
  );

  const {
    loading: backendLoading,
    error: backendError,
    status: backendStatus,
  } = useSelector(getBackendStatus(currentExperimentId));

  const { activeSecondaryAnalysisId } = useSelector((state) => state.secondaryAnalyses.meta);
  const { current: analysisStatus } = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.status,
  ) ?? {};

  const qcStatusKey = backendStatus?.pipeline?.status;
  const qcRunning = qcStatusKey === 'RUNNING';
  const qcRunningError = backendErrors.includes(qcStatusKey);

  const gem2sStatusKey = backendStatus?.gem2s?.status;
  const gem2sRunning = gem2sStatusKey === 'RUNNING';
  const gem2sRunningError = backendErrors.includes(gem2sStatusKey);
  const completedGem2sSteps = backendStatus?.gem2s?.completedSteps;
  const seuratStatusKey = backendStatus?.seurat?.status;

  const isSeurat = seuratStatusKey && hasSeuratTechnology;

  const [pipelinesRerunStatus, setPipelinesRerunStatus] = useState(null);
  const seuratRunning = seuratStatusKey === 'RUNNING' && isSeurat;
  const seuratRunningError = backendErrors.includes(seuratStatusKey) && isSeurat;
  const completedSeuratSteps = backendStatus?.seurat?.completedSteps;
  const seuratComplete = (seuratStatusKey === pipelineStatusValues.SUCCEEDED) && isSeurat;
  const waitingForQcToLaunch = gem2sStatusKey === pipelineStatusValues.SUCCEEDED
    && qcStatusKey === pipelineStatusValues.NOT_CREATED;
  // This is used to prevent a race condition where the page would start loading immediately
  // when the backend status was previously loaded. In that case, `backendLoading` is `false`
  // and would be set to true only in the `loadBackendStatus` action, the time between the
  // two events would allow pages to load.
  const [backendStatusRequested, setBackendStatusRequested] = useState(false);

  useEffect(() => {
    if (!currentExperimentId) return;
    if (!backendLoading) dispatch(loadBackendStatus(currentExperimentId));
    // need to load the samples to get the selected technology of the experiment
    // in the future, selected technology can be moved to under .experiments
    if (!samples[experimentData?.sampleIds?.[0]]) dispatch(loadSamples(routeExperimentId));
    if (isBrowser) {
      import('utils/socketConnection')
        .then(({ default: socketConnection }) => socketConnection())
        .then((io) => {
          const cb = experimentUpdatesHandler(dispatch);

          // Unload all previous socket.io hooks that may have been created for a different
          // experiment.
          io.off();
          io.on(`ExperimentUpdates-${currentExperimentId}`, (update) => cb(currentExperimentId, update));
        });
    }
  }, [routeExperimentId]);

  useEffect(() => {
    if (backendStatusRequested) {
      return;
    }

    setBackendStatusRequested(true);
  }, [backendLoading]);

  useEffect(() => {
    const setupPipeline = isSeurat ? 'seurat' : 'gem2s';

    const {
      pipeline: qcBackendStatus, [setupPipeline]: setupBackendStatus,
    } = backendStatus ?? {};

    if (!experiment || !setupBackendStatus) return;

    // The value of backend status is null for new experiments that have never run

    setPipelinesRerunStatus(
      calculatePipelinesRerunStatus(
        setupBackendStatus,
        qcBackendStatus,
        experiment,
        isSeurat,
      ),
    );
  }, [backendStatus, experiment, samples]);

  useEffect(() => {
    dispatch(loadUser());
  }, []);

  if (!user) return null;

  const getStatusObject = (type, status, message = null, completedSteps = null) => ({
    type,
    status,
    ...(message && { message }),
    ...(completedSteps && { completedSteps }),
  });

  const gem2sNotCreated = checkEveryIsValue(
    [gem2sStatusKey, seuratStatusKey],
    pipelineStatusValues.NOT_CREATED,
  );

  const getSeuratStatus = () => {
    if (seuratRunningError) {
      const errorMessage = pipelineErrorUserMessages[backendStatus?.seurat?.error?.error];
      return getStatusObject('seurat', 'error', errorMessage);
    }
    if (seuratRunning) {
      return getStatusObject('seurat', 'running', null, completedSeuratSteps);
    }
    return null;
  };

  const getGem2sStatus = () => {
    if (gem2sRunningError) return getStatusObject('gem2s', 'error');
    if (gem2sRunning && experiment?.isSubsetted) {
      return getStatusObject('gem2s', 'subsetting', null, completedGem2sSteps);
    }
    if (gem2sRunning || waitingForQcToLaunch) {
      return getStatusObject('gem2s', 'running', null, completedGem2sSteps);
    }
    if (gem2sNotCreated) return getStatusObject('gem2s', 'toBeRun');
    return null;
  };

  const getQcStatus = () => {
    if (currentModule !== modules.DATA_PROCESSING) {
      if (qcRunningError) return getStatusObject('qc', 'error');
      if (qcRunning) return getStatusObject('qc', 'running');
      if (qcStatusKey === pipelineStatusValues.NOT_CREATED) {
        return getStatusObject('qc', 'toBeRun');
      }
    }
    return null;
  };

  const getCurrentStatusScreen = () => {
    if (isSeurat) {
      return getSeuratStatus();
    }
    return getGem2sStatus() || getQcStatus();
  };

  const currentStatusScreen = getCurrentStatusScreen();

  const menuLinks = [
    {
      module: modules.SECONDARY_ANALYSIS,
      icon: <NodeExpandOutlined />,
      name: <SidebarTitle type={modules.SECONDARY_ANALYSIS}>Pipeline</SidebarTitle>,
      selectedProjectText: secondaryAnalysisName || 'No run selected',
      isDisabled: false,
      items: [
        {
          module: modules.SECONDARY_ANALYSIS_OUTPUT,
          name: (
            <SidebarTitle type={modules.SECONDARY_ANALYSIS_OUTPUT}>
              Pipeline Output
            </SidebarTitle>
          ),
          icon: <FileDoneOutlined />,
          get isDisabled() {
            return (
              !activeSecondaryAnalysisId
              || (analysisStatus
                && analysisStatus === 'not_created'
                && currentModule === modules.SECONDARY_ANALYSIS
              )
            );
          },
        },
      ],
    },
    {
      module: modules.DATA_MANAGEMENT,
      icon: <DotChartOutlined />,
      name: <SidebarTitle type={modules.DATA_MANAGEMENT}>Insights</SidebarTitle>,
      selectedProjectText: experimentName || 'No project selected',
      get isDisabled() { return getTertiaryModuleDisabled(this.module); },
      items: [
        {
          module: modules.DATA_PROCESSING,
          icon: <BuildOutlined />,
          name: <SidebarTitle type={modules.DATA_PROCESSING}>Data Processing</SidebarTitle>,
          get isDisabled() { return getTertiaryModuleDisabled(this.module); },

        },
        {
          module: modules.DATA_EXPLORATION,
          icon: <FundViewOutlined />,
          name: <SidebarTitle type={modules.DATA_EXPLORATION}>Data Exploration</SidebarTitle>,
          get isDisabled() { return getTertiaryModuleDisabled(this.module); },

        },
        {
          module: modules.PLOTS_AND_TABLES,
          icon: <BarChartOutlined />,
          name: <SidebarTitle type={modules.PLOTS_AND_TABLES}>Plots and Tables</SidebarTitle>,
          get isDisabled() { return getTertiaryModuleDisabled(this.module); },
        },
      ],
    },
  ];

  const renderContent = () => {
    if (routeExperimentId) {
      if (
        backendLoading || !backendStatusRequested) {
        return <PreloadContent />;
      }
      if (currentStatusScreen && currentStatusScreen.type !== 'qc') {
        return (
          <GEM2SLoadingScreen
            experimentId={routeExperimentId}
            pipelineStatus={currentStatusScreen.status}
            pipelineType={currentStatusScreen.type}
            pipelineErrorMessage={currentStatusScreen?.message}
            completedSteps={currentStatusScreen?.completedSteps}
            experimentName={experimentName}
          />
        );
      }
      if (currentStatusScreen?.type === 'qc') {
        return (
          <PipelineRedirectToDataProcessing
            experimentId={routeExperimentId}
            pipelineStatus={currentStatusScreen.status}
          />
        );
      }

      if (seuratComplete && currentModule === modules.DATA_PROCESSING) {
        navigateTo(modules.DATA_EXPLORATION, { experimentId: routeExperimentId });
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        return children;
      }
    }

    return children;
  };

  const getTertiaryModuleDisabled = (module) => {
    let disableIfNoExperiment = false;
    let disabledByPipelineStatus = false;
    let disabledIfSeuratComplete = false;

    switch (module) {
      case modules.DATA_PROCESSING:
        disableIfNoExperiment = true;
        disabledIfSeuratComplete = true;
        break;
      case modules.DATA_EXPLORATION:
      case modules.PLOTS_AND_TABLES:
        disableIfNoExperiment = true;
        disabledByPipelineStatus = true;
        break;
      default:
        break;
    }
    const needRerunPipeline = pipelinesRerunStatus === null || pipelinesRerunStatus.rerun;
    const notProcessedExperimentDisable = !routeExperimentId && disableIfNoExperiment
      && needRerunPipeline;

    const pipelineStatusDisable = disabledByPipelineStatus && (
      backendError || gem2sRunning || gem2sRunningError
      || waitingForQcToLaunch || qcRunning || qcRunningError
      || seuratRunning || seuratRunningError
    );

    const {
      DATA_EXPLORATION, DATA_MANAGEMENT, DATA_PROCESSING, PLOTS_AND_TABLES,
    } = modules;

    const nonExperimentModule = ![DATA_EXPLORATION,
      DATA_MANAGEMENT, DATA_PROCESSING, PLOTS_AND_TABLES]
      .includes(currentModule) && disableIfNoExperiment;

    const seuratCompleteDisable = disabledIfSeuratComplete && isSeurat;

    return notProcessedExperimentDisable || pipelineStatusDisable
      || seuratCompleteDisable || nonExperimentModule;
  };

  const menuItemRender = ({
    module,
    items,
    icon,
    name,
    selectedProjectText,
    isDisabled,
  }) => {
    const onClick = (targetModule) => {
      navigateTo(targetModule, {
        experimentId: currentExperimentId,
        secondaryAnalysisId: currentAnalysisIdRef.current,
      });
    };
    return (
      <SubMenu
        key={module}
        title={name}
        icon={icon}
        disabled={isDisabled}
        onTitleClick={() => onClick(module)}
      >
        <ItemGroup
          key='active project'
          title={(
            <Text
              style={{
                width: '100%',
                color: 'grey',
              }}
              ellipsis={{ tooltip: true }}
            >
              {selectedProjectText}
            </Text>
          )}
        >
          {items.map((item) => (
            <Item
              key={item.module}
              disabled={item.isDisabled}
              icon={item.icon}
              onClick={() => {
                onClick(item.module);
              }}
            >
              {item.name}
            </Item>
          ))}
        </ItemGroup>
      </SubMenu>
    );
  };

  if (!user) return null;

  const menuItems = menuLinks
    .map(menuItemRender);

  const isUserInModule = (module, items) => currentModule === module
    || items.some((item) => item.module === currentModule);

  return (
    <DndProvider options={HTML5toTouch}>
      {/* Privacy policy only for biomage deployment */}
      {termsOfUseNotAccepted(user, domainName) && (
        <TermsOfUseIntercept user={user} />
      )}
      <BrowserAlert />

      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          style={{
            background: brandColors.BLACK_INDIGO, overflow: 'auto', height: '100vh', position: 'fixed', left: 0,
          }}
          width={210}
          theme='dark'
          mode='inline'
          collapsible
          collapsed={collapsed}
          onCollapse={(collapse) => setCollapsed(collapse)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {collapsed ? <SmallLogo /> : <BigLogo />}
            <Menu
              style={{ background: brandColors.BLACK_INDIGO }}
              data-test-id={integrationTestConstants.ids.NAVIGATION_MENU}
              theme='dark'
              selectedKeys={[currentModule]}
              mode='inline'
              openKeys={collapsed ? undefined
                : menuLinks
                  .filter((item) => isUserInModule(item.module, item.items))
                  .map((item) => item.module)}
            >
              {menuItems}
            </Menu>
            <div style={{ marginTop: 'auto', marginBottom: '0.5em', textAlign: collapsed ? 'center' : 'left' }}>
              <FeedbackButton buttonType='text' collapsed={collapsed} />
              <ReferralButton collapsed={collapsed} />
              <Divider style={{ backgroundColor: 'hsla(0, 0%, 100%, .65)', height: '0.5px' }} />
              <div style={{ margin: '0.5em 0', textAlign: 'center' }}>
                <UserButton />
                <br />
                <br />
                <span style={{ fontSize: '0.75em', color: 'hsla(0, 0%, 100%, 0.65)' }}>
                  &copy;
                  {' '}
                  <a href='https://parsebiosciences.com/' style={{ color: 'inherit', textDecoration: 'none' }}>Parse Biosciences</a>
                  {' '}
                  2020-2025.
                  <br />
                  All rights reserved.
                </span>
              </div>
            </div>
          </div>

        </Sider>
        <CookieBanner />
        <NonParseBanner />

        <Layout
          style={!collapsed ? { marginLeft: '210px' } : { marginLeft: '80px' }} // this is the collapsed width for our sider
        >
          {renderContent()}
        </Layout>
      </Layout>

    </DndProvider>
  );
};

ContentWrapper.propTypes = {
  routeExperimentId: PropTypes.string,
  routeAnalysisId: PropTypes.string,
  experimentData: PropTypes.object,
  children: PropTypes.node,
};

ContentWrapper.defaultProps = {
  routeExperimentId: null,
  routeAnalysisId: null,
  experimentData: null,
  children: null,
};

export default ContentWrapper;
