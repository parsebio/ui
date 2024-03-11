import React, {
  useState, useEffect,
} from 'react';
import {
  Modal, Button, Empty, Typography, Space, Tooltip,
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
  launchSecondaryAnalysis,
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

const SecondaryAnalysis = () => {
  const dispatch = useDispatch();
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [secondaryAnalysisDetailsDiff, setSecondaryAnalysisDetailsDiff] = useState({});
  const [NewProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [filesNotUploaded, setFilesNotUploaded] = useState(false);
  const user = useSelector((state) => state.user.current);

  const secondaryAnalyses = useSelector((state) => state.secondaryAnalyses);
  const { activeSecondaryAnalysisId } = useSelector((state) => state.secondaryAnalyses.meta);
  const secondaryAnalysis = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId],
  );
  const secondaryAnalysisFiles = secondaryAnalysis?.files.data ?? {};
  const filesLoading = secondaryAnalysis?.files.loading;

  const { loading: statusLoading, current: currentStatus } = useSelector(
    (state) => state.secondaryAnalyses[activeSecondaryAnalysisId]?.status ?? {},
  );

  const pipelineCanBeRun = ['not_created', 'failed', 'cancelled', 'expired'].includes(currentStatus);
  const pipelineRunAccessible = currentStatus !== 'not_created';

  useEffect(() => {
    if (secondaryAnalyses.ids.length === 0) dispatch(loadSecondaryAnalyses());
  }, [user]);

  useEffect(() => {
    if (activeSecondaryAnalysisId) {
      dispatch(loadSecondaryAnalysisStatus(activeSecondaryAnalysisId));
    }

    if (activeSecondaryAnalysisId && _.isEmpty(secondaryAnalysisFiles)) {
      dispatch(loadSecondaryAnalysisFiles(activeSecondaryAnalysisId));
    }
  }, [activeSecondaryAnalysisId]);

  usePolling(async () => {
    await dispatch(loadSecondaryAnalysisStatus(activeSecondaryAnalysisId));
  }, [activeSecondaryAnalysisId]);

  const { navigateTo } = useAppRouter();

  const getFilesByType = (type) => _.pickBy(secondaryAnalysisFiles, (file) => file.type === type);

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

  const renderSampleLTFileDetails = () => {
    const sampleLTFile = Object.values(getFilesByType('samplelt'))[0];

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
    const filesToDisplay = getFilesByType('fastq');

    if (Object?.keys(filesToDisplay)?.length) {
      return (
        <FastqFileTable
          canEditTable={canEditTable}
          files={filesToDisplay}
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

  const areFilesUploaded = (type) => {
    const files = getFilesByType(type);
    if (!Object.keys(files).length) return false;
    return Object.values(files).every((file) => file.upload.status === 'uploaded');
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
          secondaryAnalysis={secondaryAnalysis}
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
          uploadedFileId={Object.keys(getFilesByType('samplelt'))[0]}
          setFilesNotUploaded={setFilesNotUploaded}
        />
      ),
      isValid: areFilesUploaded('samplelt'),
      isLoading: filesLoading,
      renderMainScreenDetails: () => renderMainScreenFileDetails(renderSampleLTFileDetails),
    },
    {
      title: 'Reference genome',
      key: 'Reference genome',
      render: () => (
        <SelectReferenceGenome
          onDetailsChanged={setSecondaryAnalysisDetailsDiff}
          secondaryAnalysis={secondaryAnalysis}
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
          secondaryAnalysisFiles={secondaryAnalysisFiles}
        />
      ),
      isValid: areFilesUploaded('fastq'),
      isLoading: filesLoading,
      renderMainScreenDetails: () => renderMainScreenFileDetails(() => renderFastqFileTable(false)),
    },
  ];
  const isAllValid = secondaryAnalysisWizardSteps.every((step) => step.isValid);

  const currentStep = secondaryAnalysisWizardSteps[currentStepIndex];
  const ANALYSIS_LIST = 'Runs';
  const ANALYSIS_DETAILS = 'Run Details';

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
                        <Button
                          type='primary'
                          disabled={!isAllValid}
                          style={{ marginBottom: '10px' }}
                          loading={statusLoading}
                          onClick={
                            () => dispatch(launchSecondaryAnalysis(activeSecondaryAnalysisId))
                          }
                        >
                          Run the pipeline
                        </Button>
                      )}

                      {pipelineRunAccessible && (
                        <Button
                          type='primary'
                          style={{ marginBottom: '10px' }}
                          loading={statusLoading}
                          onClick={() => (
                            navigateTo(
                              modules.SECONDARY_ANALYSIS_OUTPUT,
                              { secondaryAnalysisId: activeSecondaryAnalysisId },
                            )
                          )}
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
      <Header title='Secondary Analysis' />
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

export default SecondaryAnalysis;
