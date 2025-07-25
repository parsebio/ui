import React, {
  useState, useEffect, useMemo,
} from 'react';
import {
  Modal, Button, Empty, Typography, Space, Tooltip, Popconfirm, Popover,
} from 'antd';

import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import SecondaryAnalysisSettings from 'components/secondary-analysis/SecondaryAnalysisSettings';
import SampleLTUpload from 'components/secondary-analysis/SampleLTUpload';
import { useSelector, useDispatch } from 'react-redux';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';
import UploadFastqForm from 'components/secondary-analysis/UploadFastqForm';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';
import MultiTileContainer from 'components/MultiTileContainer';
import NewProjectModal from 'components/data-management/project/NewProjectModal';
import {
  loadSecondaryAnalyses, updateSecondaryAnalysis,
  createSecondaryAnalysis, loadSecondaryAnalysisFiles, loadSecondaryAnalysisStatus,
  storeLoadedAnalysisFile,
} from 'redux/actions/secondaryAnalyses';
import EditableParagraph from 'components/EditableParagraph';
import kitOptions from 'utils/secondary-analysis/kitOptions';
import FastqFilesTable from 'components/secondary-analysis/FastqFilesTable';
import UploadStatusView from 'components/UploadStatusView';
import PrettyTime from 'components/PrettyTime';
import _ from 'lodash';
import usePolling from 'utils/customHooks/usePolling';

import { modules } from 'const';
import { useAppRouter } from 'utils/AppRouteProvider';
import launchSecondaryAnalysis from 'redux/actions/secondaryAnalyses/launchSecondaryAnalysis';
import { getSampleLTFile, getFastqFiles, getPairMatchesAreValid } from 'redux/selectors';
import useConditionalEffect from 'utils/customHooks/useConditionalEffect';
import ShareProjectModal from 'components/data-management/project/ShareProjectModal';
import termsOfUseNotAccepted from 'utils/termsOfUseNotAccepted';
import FastqPairsMatcher from 'components/secondary-analysis/FastqPairsMatcher';
import FastqFileType from 'const/enums/FastqFileType';
import ImmuneDatabase, { immuneDbToDisplay } from 'components/secondary-analysis/ImmuneDatabase';
import KitCategory, { isKitCategory } from 'const/enums/KitCategory';

const { Text, Title } = Typography;
const keyToTitle = {
  numOfSublibraries: 'Number of sublibraries',
  chemistryVersion: 'Chemistry version',
  kit: 'Kit type',
  name: 'File name',
  status: 'Status',
  createdAt: 'Uploaded at',
};

const pipelineStatusToDisplay = {
  not_created: 'Not started yet',
  created: 'Created',
  failed: 'Failed',
  cancelled: 'Cancelled',
  expired: 'Failed',
  running: 'Running',
  finished: 'Finished',
};

const analysisDetailsKeys = [
  'name',
  'description',
  'sampleNames',
  'numOfSublibraries',
  'chemistryVersion',
  'kit',
  'refGenome',
  'pairedWt',
  'immuneDatabase',
];

const wtStepsGrid = [
  // row0
  [
    // col0.0
    'Experimental setup',
    // col0.1
    'Sample loading table',
    // col0.2
    'Reference genome',
  ],
  // row1
  'Fastq files',
];

const tcrStepsGrid = [
  // row0
  [
    // col0.0
    'Experimental setup',
    // col0.1
    'Sample loading table',
    // col0.2
    [
      // row0.2.0
      'Reference genome',
      // row0.2.1
      'Immune database',
    ],
  ],
  // row1
  'Fastq files',
];

const pairedWTStepsGrid = [
  // row0
  [
    // col0.0
    'Experimental setup',
    // col0.1
    'Sample loading table',
    // col0.2
    [
      // row0.2.0
      'Reference genome',
      // row0.2.1
      'Immune database',
    ],
  ],
  // row1
  'Fastq files',
  // row2
  'Fastq Pairs Matcher',
];

const flattenedToKeys = (grid) => {
  const result = [];

  const dfs = (node) => {
    if (Array.isArray(node)) {
      node.forEach(dfs);
    } else if (typeof node === 'string') {
      result.push(node);
    }
  };

  dfs(grid);

  return result;
};

const getFastqsMatch = (fastqFiles, numOfSublibraries) => (
  Object.keys(fastqFiles).length === numOfSublibraries * 2
);

const Pipeline = () => {
  const dispatch = useDispatch();
  const { navigateTo } = useAppRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [secondaryAnalysisDetailsDiff, setSecondaryAnalysisDetailsDiff] = useState({});
  const [NewProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [filesNotUploaded, setFilesNotUploaded] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [shareProjectModalVisible, setShareProjectModalVisible] = useState(false);

  const user = useSelector((state) => state.user.current);

  const initialLoadPending = useSelector(
    (state) => state.secondaryAnalyses.meta.initialLoadPending,
    _.isEqual,
  );

  const activeSecondaryAnalysisId = useSelector(
    (state) => state.secondaryAnalyses.meta.activeSecondaryAnalysisId,
    _.isEqual,
  );

  const {
    name: analysisName,
    description: analysisDescription,
    sampleNames,
    numOfSublibraries,
    chemistryVersion,
    kit,
    refGenome,
    pairedWt,
    immuneDatabase,
  } = useSelector(
    (state) => _.pick(
      state.secondaryAnalyses[activeSecondaryAnalysisId] ?? {},
      analysisDetailsKeys,
    ),
    _.isEqual,
  );

  const pairMatches = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.files?.pairMatches,
    _.isEqual,
  );

  const filesNotLoadedYet = useSelector(
    (state) => _.isNil(state.secondaryAnalyses[activeSecondaryAnalysisId]?.files?.data),
    _.isEqual,
  );

  const currentSecondaryAnalysisStatus = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.status?.current,
    _.isEqual,
  );

  const pairMatchesAreValid = useSelector(getPairMatchesAreValid(activeSecondaryAnalysisId));

  const sampleLTFile = useSelector(getSampleLTFile(activeSecondaryAnalysisId), _.isEqual);
  const immuneFastqFiles = useSelector(
    getFastqFiles(activeSecondaryAnalysisId, FastqFileType.IMMUNE_FASTQ),
    _.isEqual,
  );

  const wtFastqFiles = useSelector(
    getFastqFiles(activeSecondaryAnalysisId, FastqFileType.WT_FASTQ),
    _.isEqual,
  );

  const fastqFiles = { ...immuneFastqFiles, ...wtFastqFiles };

  const domainName = useSelector((state) => state.networkResources?.domainName);

  const fastqsMatch = getFastqsMatch(wtFastqFiles, numOfSublibraries)
    && (!pairedWt || getFastqsMatch(immuneFastqFiles, numOfSublibraries));

  const { loading: statusLoading, current: currentStatus, shouldRerun } = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.status,
  ) ?? {};

  const pipelineCanBeRun = !['created', 'running'].includes(currentStatus);
  const pipelineRunAccessible = currentStatus !== 'not_created';

  useConditionalEffect(() => {
    if (termsOfUseNotAccepted(user, domainName)) return;

    if (initialLoadPending) dispatch(loadSecondaryAnalyses());
  }, [user]);

  useEffect(() => {
    if (activeSecondaryAnalysisId) {
      dispatch(loadSecondaryAnalysisFiles(activeSecondaryAnalysisId));
      dispatch(loadSecondaryAnalysisStatus(activeSecondaryAnalysisId));
    }
  }, [activeSecondaryAnalysisId]);

  useConditionalEffect(() => {
    if (
      activeSecondaryAnalysisId
      && sampleLTFile
      && _.size(fastqFiles) > 0
      && allFilesUploaded({ ...fastqFiles, [sampleLTFile.id]: sampleLTFile })
    ) {
      dispatch(loadSecondaryAnalysisStatus(activeSecondaryAnalysisId));
    }
  }, [
    activeSecondaryAnalysisId,
    fastqFiles,
    sampleLTFile,
    kit,
    chemistryVersion,
    numOfSublibraries,
    refGenome,
    pairedWt,
    pairMatches,
    immuneDatabase,
  ]);

  // Poll for status
  usePolling(async () => {
    if (!['running', 'created'].includes(currentSecondaryAnalysisStatus)) return;

    await dispatch(loadSecondaryAnalysisStatus(activeSecondaryAnalysisId));
  }, [activeSecondaryAnalysisId, currentSecondaryAnalysisStatus]);

  useEffect(() => {
    import('utils/socketConnection')
      .then(({ default: socketConnection }) => socketConnection())
      .then((io) => {
        // remove previous listeners, in case the secondary analysis has changed
        io.off();
        io.on(`fileUpdates-${activeSecondaryAnalysisId}`, (message) => {
          dispatch(storeLoadedAnalysisFile(activeSecondaryAnalysisId, message.file));
        });

        return () => {
          io.off('uploadStatus');
        };
      });
  }, [activeSecondaryAnalysisId]);

  const handleUpdateSecondaryAnalysisDetails = () => {
    if (Object.keys(secondaryAnalysisDetailsDiff).length) {
      dispatch(updateSecondaryAnalysis(activeSecondaryAnalysisId, secondaryAnalysisDetailsDiff));
      setSecondaryAnalysisDetailsDiff({});
    }
  };

  const mainScreenDetails = (detailsObj) => {
    const view = Object.keys(detailsObj).map((key) => {
      const value = detailsObj[key];
      const title = keyToTitle[key];
      return (
        <div
          key={key}
          style={{
            display: 'flex',
            marginBottom: window.innerHeight > 850 ? '0.6vh' : '0',
            alignItems: 'center', // Ensure items are aligned in the center vertically
          }}
        >
          {title && (
            <span style={{ fontWeight: 'bold', fontSize: '1.4vh', marginRight: '0.5vh' }}>
              {`${title}:`}
            </span>
          )}
          <span
            style={{
              fontSize: '1.4vh',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '15vw',
              whiteSpace: 'nowrap',
            }}
            title={value?.length > 20 ? value : ''}
          >
            {value || 'Not selected'}
          </span>
        </div>
      );
    });
    return view;
  };

  const renderSampleLTFileDetails = () => {
    if (!sampleLTFile) return null;

    const { name, upload, createdAt } = sampleLTFile;
    const sampleCount = sampleNames?.length || 0;

    return mainScreenDetails({
      name,
      status: <UploadStatusView
        status={upload.status.current}
        fileId={sampleLTFile.id}
        secondaryAnalysisId={activeSecondaryAnalysisId}
      />,
      createdAt: <PrettyTime isoTime={createdAt} />,
      samples: sampleCount && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <b>{`${sampleCount} samples`}</b>
          <Popover
            content={(
              <div style={{
                display: 'inline-block',
                width: '100%',
                maxWidth: '200px',
                maxHeight: '30vh',
                overflowY: 'auto',
              }}
              >
                {sampleNames.map((sampleName) => (
                  <div
                    key={sampleName}
                    style={{
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      padding: '3px',
                    }}
                  >
                    {sampleName}
                  </div>
                ))}
              </div>
            )}
            title='Sample Names'
            trigger='click'
          >
            <Button style={{ fontSize: '1.4vh' }} type='link'>View Sample Names</Button>
          </Popover>
        </div>
      ),
    });
  };

  const renderFastqFilesTable = (canEditTable) => {
    if (Object?.keys(fastqFiles)?.length) {
      return (
        <FastqFilesTable
          canEditTable={canEditTable}
          files={fastqFiles}
          secondaryAnalysisId={activeSecondaryAnalysisId}
          pairedWt={pairedWt}
          kit={kit}
        />
      );
    }
    return null;
  };

  const renderMainScreenFileDetails = (renderFunc) => renderFunc() || (
    window.innerHeight > 768 ? (
      <Empty
        style={{ fontSize: '1.4vh' }}
        description='Not uploaded'
        imageStyle={{ fontSize: window.innerWidth > 768 ? '24px' : '16px' }}
      />
    ) : (
      <span style={{ display: 'flex', justifyContent: 'center', fontSize: '1.4vh' }}>Not uploaded</span>
    )
  );

  const allFilesUploaded = (files) => {
    if (_.size(files) === 0) return false;
    return Object.values(files).every((file) => file?.upload?.status?.current === 'uploaded');
  };

  const wizardStepsData = {
    'Experimental setup': {
      title: 'Provide the details of the experimental setup:',
      key: 'Experimental setup',
      render: () => (
        <SecondaryAnalysisSettings
          secondaryAnalysisId={activeSecondaryAnalysisId}
          onDetailsChanged={setSecondaryAnalysisDetailsDiff}
        />
      ),
      isValid: (numOfSublibraries && chemistryVersion && kit),
      renderMainScreenDetails: () => {
        const kitTitle = kitOptions.find((option) => option.value === kit)?.label;
        return mainScreenDetails({
          kit: kitTitle, chemistryVersion, numOfSublibraries,
        });
      },
      getIsDisabled: () => false,
    },
    'Sample loading table': {
      title: 'Upload your sample loading table:',
      key: 'Sample loading table',
      render: () => (
        <SampleLTUpload
          secondaryAnalysisId={activeSecondaryAnalysisId}
          renderUploadedFileDetails={renderSampleLTFileDetails}
          uploadedFileId={sampleLTFile?.id}
          setFilesNotUploaded={setFilesNotUploaded}
          onDetailsChanged={setSecondaryAnalysisDetailsDiff}
        />
      ),
      isValid: allFilesUploaded([sampleLTFile]),
      isLoading: filesNotLoadedYet,
      renderMainScreenDetails: () => renderMainScreenFileDetails(renderSampleLTFileDetails),
      getIsDisabled: () => false,
    },
    'Reference genome': {
      title: 'Reference genome',
      key: 'Reference genome',
      render: () => (
        <SelectReferenceGenome
          onDetailsChanged={setSecondaryAnalysisDetailsDiff}
          previousGenome={refGenome}
        />
      ),
      isValid: Boolean(refGenome),
      renderMainScreenDetails: () => mainScreenDetails({ refGenome }),
      getIsDisabled: () => false,
    },
    'Immune database': {
      title: 'Immune database',
      key: 'Immune database',
      render: () => (
        <ImmuneDatabase
          onDetailsChanged={setSecondaryAnalysisDetailsDiff}
          database={immuneDatabase}
          kitCategory={KitCategory.fromKit(kit)}
        />
      ),
      isValid: Boolean(immuneDatabase),
      renderMainScreenDetails: () => mainScreenDetails({ immuneDatabase: immuneDbToDisplay[immuneDatabase] || 'Not selected' }),
      getIsDisabled: () => false,
    },
    'Fastq files': {
      title: 'Upload your FASTQ files:',
      key: 'Fastq files',
      render: () => (
        <UploadFastqForm
          secondaryAnalysisId={activeSecondaryAnalysisId}
          renderFastqFilesTable={() => renderFastqFilesTable(true)}
          setFilesNotUploaded={setFilesNotUploaded}
        />
      ),
      isValid: allFilesUploaded(fastqFiles) && fastqsMatch,
      isLoading: filesNotLoadedYet,
      renderMainScreenDetails: () => renderMainScreenFileDetails(
        () => renderFastqFilesTable(false),
      ),
      getIsDisabled: () => false,
    },
    'Fastq Pairs Matcher': {
      title: 'Match FASTQ files',
      key: 'Fastq Pairs Matcher',
      render: () => <FastqPairsMatcher />,
      isValid: pairMatchesAreValid,
      isLoading: filesNotLoadedYet,
      renderMainScreenDetails: () => <FastqPairsMatcher />,
      getIsDisabled: () => {
        const stepsToCheck = ['Fastq files', 'Experimental setup'];

        // Disable until the other steps are completed and valid
        return stepsToCheck.some((stepKey) => !activeSteps[stepKey]?.isValid);
      },
    },
  };

  const activeStepsGrid = useMemo(
    () => {
      if (isKitCategory(kit, [KitCategory.TCR, KitCategory.BCR])) {
        return pairedWt === true ? pairedWTStepsGrid : tcrStepsGrid;
      }
      return wtStepsGrid;
    },
    [kit, pairedWt],
  );

  const activeStepsKeys = useMemo(() => flattenedToKeys(activeStepsGrid), [activeStepsGrid]);

  const activeSteps = useMemo(
    () => _.pick(wizardStepsData, activeStepsKeys),
    [activeStepsKeys, wizardStepsData],
  );

  const isAllValid = Object.values(activeSteps).every((step) => step.isValid);

  const currentStep = activeSteps[activeStepsKeys[currentStepIndex]];
  const ANALYSIS_LIST = 'Runs';
  const ANALYSIS_DETAILS = 'Run Details';

  const renderLaunchAnalysisButton = () => {
    const firstTimeLaunch = currentStatus === 'not_created';

    const launchAnalysis = () => {
      setButtonClicked(true);
      dispatch(launchSecondaryAnalysis(activeSecondaryAnalysisId))
        .then(() => {
          navigateTo(
            modules.SECONDARY_ANALYSIS_OUTPUT,
            { secondaryAnalysisId: activeSecondaryAnalysisId },
          );
        })
        .catch(() => {
          setButtonClicked(false);
        });
    };

    if (firstTimeLaunch) {
      return (
        <Button
          type='primary'
          disabled={!isAllValid}
          style={{ marginBottom: '10px' }}
          loading={statusLoading || buttonClicked}
          onClick={() => launchAnalysis()}
        >
          Run the pipeline
        </Button>
      );
    }

    return (
      <Tooltip
        title={(currentStatus === 'finished' && shouldRerun === false) ? 'The pipeline has finished successfully.' : ''}
        placement='top'
      >
        <Popconfirm
          title='This action will cause any outputs of previous pipeline runs to be lost. Are you sure you want to rerun the pipeline?'
          disabled={!(isAllValid && shouldRerun)}
          onConfirm={() => launchAnalysis()}
          okText='Yes'
          cancelText='No'
          placement='bottom'
          overlayStyle={{ maxWidth: '250px' }}
        >
          <Button
            disabled={!(isAllValid && shouldRerun)}
            style={{ marginBottom: '10px' }}
            loading={statusLoading || buttonClicked}
          >
            Rerun the pipeline
          </Button>
        </Popconfirm>
      </Tooltip>
    );
  };

  const TILE_MAP = {
    [ANALYSIS_LIST]: {
      toolbarControls: [],
      component: (width, height) => (
        <ProjectsListContainer
          height={height}
          projectType='secondaryAnalyses'
          onCreateNewProject={() => setNewProjectModalVisible(true)}
        />
      ),
    },
    [ANALYSIS_DETAILS]: {
      toolbarControls: [],
      component: (width, height) => (
        <div style={{
          // Remove header 60 from height calculation
          // TODO move this calculation to a dynamic version in the MultiTileContainer,
          // since we receive an inaccurate height right now
          display: 'flex', flexDirection: 'column', height: height - 60, width: '100%',
        }}
        >
          {
            activeSecondaryAnalysisId ? (
              <div style={{ height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', overflowY: 'auto' }}>
                  <Space direction='vertical'>
                    <Title level={4}>{analysisName}</Title>
                    <Text type='secondary'>
                      {`Run ID: ${activeSecondaryAnalysisId}`}
                    </Text>
                  </Space>

                  <Space align='baseline'>
                    <Text strong style={{ marginRight: '10px' }}>
                      {`Current status: ${pipelineStatusToDisplay[currentStatus] || ''}`}
                    </Text>
                    <Button
                      onClick={() => setShareProjectModalVisible(!shareProjectModalVisible)}
                    >
                      Share
                    </Button>
                    {shareProjectModalVisible && (
                      <ShareProjectModal
                        projectType='secondaryAnalysis'
                        onCancel={() => setShareProjectModalVisible(false)}
                        project={{ name: analysisName, id: activeSecondaryAnalysisId }}
                      />
                    )}
                    <Tooltip
                      title={!isAllValid && fastqsMatch
                        ? 'Ensure that all sections are completed in order to proceed with running the pipeline.'
                        : !fastqsMatch
                          ? 'All sections must be completed to run the pipeline. You should upload exactly one pair of FASTQ files per sublibrary - check that the number of FASTQ file pairs matches the number of sublibraries specified in the Experimental setup section.'
                          : ''}
                      placement='left'
                    >
                      <Space direction='horizontal'>
                        {pipelineCanBeRun && renderLaunchAnalysisButton()}
                        {pipelineRunAccessible && (
                          <Button
                            type='primary'
                            style={{ marginBottom: '10px' }}
                            loading={statusLoading || buttonClicked}
                            onClick={() => {
                              setButtonClicked(true);
                              navigateTo(
                                modules.SECONDARY_ANALYSIS_OUTPUT,
                                { secondaryAnalysisId: activeSecondaryAnalysisId },
                              );
                            }}
                          >
                            Go to output
                          </Button>
                        )}
                      </Space>
                    </Tooltip>

                  </Space>
                </div>
                <Text strong>Description:</Text>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <EditableParagraph
                    value={analysisDescription ?? ''}
                    onUpdate={(text) => {
                      if (text !== analysisDescription) {
                        dispatch(
                          updateSecondaryAnalysis(
                            activeSecondaryAnalysisId,
                            { description: text },
                          ),
                        );
                      }
                    }}
                  />
                  <OverviewMenu
                    wizardSteps={activeSteps}
                    activeStepsGrid={activeStepsGrid}
                    setCurrentStep={setCurrentStepIndex}
                    editable={pipelineCanBeRun}
                  />
                </div>
              </div>
            ) : <Empty description='Create a new run to get started' />
          }
        </div>
      ),
    },
  };

  const windows = {
    direction: 'row',
    first: ANALYSIS_LIST,
    second: ANALYSIS_DETAILS,
    splitPercentage: 23,
  };

  const handleNavigationWithConfirmation = (action) => {
    if (filesNotUploaded) {
      Modal.confirm({
        title: "You have files selected to be uploaded. Click 'upload' or 'replace' to proceed, or discard the files to upload them later.",
        onOk: () => { action(); setFilesNotUploaded(false); },
        okText: 'Discard selected files',
        cancelText: 'I will upload',
      });
    } else {
      action();
    }
  };

  const onNext = () => handleNavigationWithConfirmation(() => {
    setCurrentStepIndex(currentStepIndex + 1);
    handleUpdateSecondaryAnalysisDetails();
  });

  const onBack = () => handleNavigationWithConfirmation(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  });

  const onCancel = () => handleNavigationWithConfirmation(() => {
    setCurrentStepIndex(null);
    handleUpdateSecondaryAnalysisDetails();
  });

  return (
    <>
      {currentStep && (
        <Modal
          open
          width={currentStep.key === 'Fastq files' ? '50%' : '30%'}
          height='90%'
          title={currentStep.title}
          okButtonProps={{ htmlType: 'submit' }}
          bodyStyle={{ minHeight: '20dvh', maxHeight: '75dvh', overflowY: 'auto' }}
          onCancel={onCancel}
          footer={[
            <Button key='back' onClick={onBack} style={{ display: currentStepIndex > 0 ? 'inline' : 'none' }}>
              Back
            </Button>,
            <Button key='submit' type='primary' onClick={onNext}>
              {currentStepIndex === _.size(activeSteps) - 1 ? 'Finish' : 'Next'}
            </Button>,
          ]}
        >
          {
            currentStep.getIsDisabled() ? null : currentStep.render()
          }
        </Modal>
      )}
      <div data-testid='pipeline-container' style={{ height: '100vh', overflowY: 'auto' }}>
        {NewProjectModalVisible && (
          <NewProjectModal
            projectType='secondaryAnalyses'
            onCancel={() => { setNewProjectModalVisible(false); }}
            onCreate={async (name, description) => {
              await dispatch(createSecondaryAnalysis(name, description));
              setCurrentStepIndex(0);
              setNewProjectModalVisible(false);
            }}
          />
        )}
        <MultiTileContainer
          tileMap={TILE_MAP}
          initialArrangement={windows}
        />
      </div>
    </>
  );
};

export default Pipeline;
