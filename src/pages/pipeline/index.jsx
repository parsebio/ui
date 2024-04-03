import React, {
  useState, useEffect, useCallback,
} from 'react';
import {
  Modal, Button, Empty, Typography, Space, Tooltip, Popconfirm,
} from 'antd';
import Header from 'components/Header';
import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import SecondaryAnalysisSettings from 'components/secondary-analysis/SecondaryAnalysisSettings';
import SampleLTUpload from 'components/secondary-analysis/SampleLTUpload';
import { useSelector, useDispatch } from 'react-redux';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';
import UploadFastQ from 'components/secondary-analysis/UploadFastQ';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';
import MultiTileContainer from 'components/MultiTileContainer';
import NewProjectModal from 'components/data-management/project/NewProjectModal';
import {
  loadSecondaryAnalyses, updateSecondaryAnalysis,
  createSecondaryAnalysis, loadSecondaryAnalysisFiles, loadSecondaryAnalysisStatus,
} from 'redux/actions/secondaryAnalyses';
import EditableParagraph from 'components/EditableParagraph';
import kitOptions from 'utils/secondary-analysis/kitOptions.json';
import FastqFileTable from 'components/secondary-analysis/FastqFileTable';
import UploadStatusView from 'components/UploadStatusView';
import PrettyTime from 'components/PrettyTime';
import _ from 'lodash';
import usePolling from 'utils/customHooks/usePolling';
import { modules } from 'utils/constants';
import { useAppRouter } from 'utils/AppRouteProvider';
import launchSecondaryAnalysis from 'redux/actions/secondaryAnalyses/launchSecondaryAnalysis';

const { Text, Title } = Typography;
const keyToTitle = {
  numOfSamples: 'Number of samples',
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

const SAMPLE_LOADING_TABLE = 'samplelt';
const FASTQ = 'fastq';

const mainScreenDetails = (detailsObj) => {
  const view = Object.keys(detailsObj).map((key) => {
    const value = detailsObj[key];
    const title = keyToTitle[key];
    return (
      <div
        key={key}
        style={{
          display: 'flex',
          marginBottom: '10px',
          overflow: 'hidden',
        }}
      >
        {title && (
          <span style={{ fontWeight: 'bold' }}>
            {`${title}:`}
          </span>
        )}
        &nbsp;
        <span>
          {value || 'Not selected'}
        </span>
      </div>
    );
  });
  return view;
};

const Pipeline = () => {
  const dispatch = useDispatch();
  const { navigateTo } = useAppRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [secondaryAnalysisDetailsDiff, setSecondaryAnalysisDetailsDiff] = useState({});
  const [NewProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [filesNotUploaded, setFilesNotUploaded] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  console.log('SecondaryAnalysisDebug');

  const user = useSelector((state) => state.user.current);

  const secondaryAnalysisIds = useSelector((state) => state.secondaryAnalyses.ids, _.isEqual);
  const activeSecondaryAnalysisId = useSelector(
    (state) => state.secondaryAnalyses.meta.activeSecondaryAnalysisId,
    _.isEqual,
  );

  const secondaryAnalysis = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId],
    _.isEqual,
    // () => true,
  );

  const filesLoading = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.files.loading ?? {},
    _.isEqual,
    // () => true,
  );

  const currentSecondaryAnalysisStatus = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.status?.current,
    _.isEqual,
  );

  const sampleLTFile = useSelector(
    (state) => Object.values(_.pickBy(state.secondaryAnalyses[activeSecondaryAnalysisId]?.files.data, (file) => file.type === SAMPLE_LOADING_TABLE))[0],
    _.isEqual,
  );

  const fastqFiles = useSelector(
    (state) => _.pickBy(state.secondaryAnalyses[activeSecondaryAnalysisId]?.files.data, (file) => file.type === FASTQ),
    _.isEqual,
  );

  const { loading: statusLoading, current: currentStatus } = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.status ?? {},
  );

  const pipelineCanBeRun = !['created', 'running'].includes(currentStatus);
  const pipelineRunAccessible = currentStatus !== 'not_created';

  useEffect(() => {
    if (secondaryAnalysisIds.length === 0) dispatch(loadSecondaryAnalyses());
  }, [user]);

  useEffect(() => {
    if (activeSecondaryAnalysisId) {
      dispatch(loadSecondaryAnalysisStatus(activeSecondaryAnalysisId));
    }

    if (activeSecondaryAnalysisId) {
      dispatch(loadSecondaryAnalysisFiles(activeSecondaryAnalysisId));
    }
  }, [activeSecondaryAnalysisId]);

  // Poll for status
  usePolling(async () => {
    if (!['running', 'created'].includes(currentSecondaryAnalysisStatus)) return;

    await dispatch(loadSecondaryAnalysisStatus(activeSecondaryAnalysisId));
  }, [activeSecondaryAnalysisId, currentSecondaryAnalysisStatus]);

  // Poll for files (in case the cli is uploading)
  usePolling(async () => {
    // If executing, no need to get files updates
    if (['running', 'created'].includes(currentSecondaryAnalysisStatus)) return;

    await dispatch(loadSecondaryAnalysisFiles(activeSecondaryAnalysisId));
  }, [activeSecondaryAnalysisId, currentSecondaryAnalysisStatus], 5000);

  const handleUpdateSecondaryAnalysisDetails = () => {
    if (Object.keys(secondaryAnalysisDetailsDiff).length) {
      dispatch(updateSecondaryAnalysis(activeSecondaryAnalysisId, secondaryAnalysisDetailsDiff));
      setSecondaryAnalysisDetailsDiff({});
    }
  };

  const renderSampleLTFileDetails = () => {
    if (!sampleLTFile) return null;

    const { name, upload, createdAt } = sampleLTFile;
    return mainScreenDetails({
      name,
      status: <UploadStatusView
        status={upload.status}
        fileId={sampleLTFile.id}
        secondaryAnalysisId={activeSecondaryAnalysisId}
      />,
      createdAt: <PrettyTime isoTime={createdAt} />,
    });
  };

  const renderFastqFileTable = (canEditTable) => {
    if (Object?.keys(fastqFiles)?.length) {
      return (
        <FastqFileTable
          canEditTable={canEditTable}
          files={fastqFiles}
          secondaryAnalysisId={activeSecondaryAnalysisId}
        />
      );
    }
    return null;
  };

  const renderMainScreenFileDetails = (renderFunc) => (renderFunc() || (
    <Empty
      description='Not uploaded'
    />
  ));

  const allFilesUploaded = (files) => {
    if (!files || Object.keys(files).length === 0) return false;
    console.log('filesDebug');
    console.log(files);
    return Object.values(files).every((file) => file?.upload?.status === 'uploaded');
  };

  const {
    numOfSamples, numOfSublibraries, chemistryVersion, kit, refGenome,
  } = secondaryAnalysis || {};

  const secondaryAnalysisWizardSteps = [
    {
      title: 'Provide the details of the experimental setup:',
      key: 'Experimental setup',
      render: () => (
        <SecondaryAnalysisSettings
          onDetailsChanged={setSecondaryAnalysisDetailsDiff}
          secondaryAnalysisDetails={{
            numOfSamples, numOfSublibraries, chemistryVersion, kit,
          }}
        />
      ),
      isValid: (numOfSamples && numOfSublibraries && chemistryVersion && kit),
      renderMainScreenDetails: () => {
        const kitTitle = kitOptions.find((option) => option.value === kit)?.label;
        return mainScreenDetails({
          kit: kitTitle, chemistryVersion, numOfSamples, numOfSublibraries,
        });
      },
    },
    {
      title: 'Upload your sample loading table:',
      key: 'Sample loading table',
      render: () => (
        <SampleLTUpload
          secondaryAnalysisId={activeSecondaryAnalysisId}
          renderUploadedFileDetails={renderSampleLTFileDetails}
          uploadedFileId={sampleLTFile?.id}
          setFilesNotUploaded={setFilesNotUploaded}
        />
      ),
      isValid: allFilesUploaded([sampleLTFile]),
      isLoading: filesLoading,
      renderMainScreenDetails: () => renderMainScreenFileDetails(renderSampleLTFileDetails),
    },
    {
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
    },
    {
      title: 'Upload your Fastq files:',
      key: 'Fastq files',
      render: () => (
        <UploadFastQ
          secondaryAnalysisId={activeSecondaryAnalysisId}
          renderFastqFileTable={() => renderFastqFileTable(true)}
          setFilesNotUploaded={setFilesNotUploaded}
        />
      ),
      isValid: allFilesUploaded(fastqFiles),
      isLoading: filesLoading,
      renderMainScreenDetails: () => renderMainScreenFileDetails(() => renderFastqFileTable(false)),
    },
  ];
  const isAllValid = secondaryAnalysisWizardSteps.every((step) => step.isValid);

  const currentStep = secondaryAnalysisWizardSteps[currentStepIndex];
  const ANALYSIS_LIST = 'Runs';
  const ANALYSIS_DETAILS = 'Run Details';

  const LaunchAnalysisButton = () => {
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
      <Popconfirm
        title='This action will cause any outputs of previous pipeline runs to be lost. Are you sure you want to rerun the pipeline?'
        disabled={!isAllValid}
        onConfirm={() => launchAnalysis()}
        okText='Yes'
        cancelText='No'
        placement='bottom'
        overlayStyle={{ maxWidth: '250px' }}
      >
        <Button
          disabled={!isAllValid}
          style={{ marginBottom: '10px' }}
          loading={statusLoading || buttonClicked}
        >
          Rerun the pipeline
        </Button>
      </Popconfirm>
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
      component: () => (
        <div style={{
          display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
        }}
        >
          {
            activeSecondaryAnalysisId ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', overflowY: 'auto' }}>
                  <Space direction='vertical'>
                    <Title level={4}>{secondaryAnalysis.name}</Title>
                    <Text type='secondary'>
                      {`Run ID: ${activeSecondaryAnalysisId}`}
                    </Text>
                  </Space>
                  <Tooltip
                    title={!isAllValid
                      ? 'Ensure that all sections are completed in order to proceed with running the pipeline.'
                      : undefined}
                    placement='left'
                  >
                    <Space align='baseline'>
                      <Text strong style={{ marginRight: '10px' }}>
                        {`Current status: ${pipelineStatusToDisplay[currentStatus]}`}
                      </Text>
                      {pipelineCanBeRun && (
                        <LaunchAnalysisButton />
                      )}

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
                </div>
                <Text strong>Description:</Text>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <EditableParagraph
                    value={secondaryAnalysis.description || ''}
                    onUpdate={(text) => {
                      if (text !== secondaryAnalysis.description) {
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
                    wizardSteps={secondaryAnalysisWizardSteps}
                    setCurrentStep={setCurrentStepIndex}
                    editable={pipelineCanBeRun}
                  />
                </div>
              </>
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
      <Header title='Pipeline' />
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
      {currentStep && (
        <Modal
          open
          title={currentStep.title}
          okButtonProps={{ htmlType: 'submit' }}
          bodyStyle={{ minHeight: '41dvh', maxHeight: '60dvh', overflowY: 'auto' }}
          style={{ minWidth: '70dvh' }}
          onCancel={onCancel}
          footer={[
            <Button key='back' onClick={onBack} style={{ display: currentStepIndex > 0 ? 'inline' : 'none' }}>
              Back
            </Button>,
            <Button key='submit' type='primary' onClick={onNext}>
              {currentStepIndex === secondaryAnalysisWizardSteps.length - 1 ? 'Finish' : 'Next'}
            </Button>,
          ]}
        >
          {currentStep.render()}
        </Modal>
      )}

      <MultiTileContainer
        tileMap={TILE_MAP}
        initialArrangement={windows}
      />
    </>
  );
};

export default Pipeline;
