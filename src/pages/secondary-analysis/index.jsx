import React, { useState, useEffect } from 'react';
import {
  Modal, Button, Empty, Typography, Space, Tooltip,
} from 'antd';
import Header from 'components/Header';
import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import SecondaryAnalysisDetails from 'components/secondary-analysis/SecondaryAnalysisDetails';
import SampleLTUpload from 'components/secondary-analysis/SampleLTUpload';
import { useSelector, useDispatch } from 'react-redux';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';
import UploadFastQ from 'components/secondary-analysis/UploadFastQ';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';
import MultiTileContainer from 'components/MultiTileContainer';
import NewProjectModal from 'components/data-management/project/NewProjectModal';
import {
  loadSecondaryAnalyses, updateSecondaryAnalysis,
  createSecondaryAnalysis, loadSecondaryAnalysisFiles,
} from 'redux/actions/secondaryAnalyses';
import EditableParagraph from 'components/EditableParagraph';
import kitOptions from 'utils/secondary-analysis/kitOptions.json';

const { Text, Title } = Typography;
const keyToTitle = {
  numOfSamples: 'Number of samples',
  numOfSublibraries: 'Number of sublibraries',
  chemistryVersion: 'Chemistry version',
  kit: 'Kit type',
};
const SecondaryAnalysis = () => {
  const dispatch = useDispatch();
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [secondaryAnalysisDetailsDiff, setNewSecondaryAnalysisDetailsDiff] = useState({});
  const [NewProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const user = useSelector((state) => state.user.current);

  const secondaryAnalyses = useSelector((state) => state.secondaryAnalyses);
  const { activeSecondaryAnalysisId } = useSelector((state) => state.secondaryAnalyses.meta);
  const secondaryAnalysis = useSelector((state) => state.secondaryAnalyses[activeSecondaryAnalysisId]);

  useEffect(() => {
    if (secondaryAnalyses.ids.length === 0) dispatch(loadSecondaryAnalyses());
  }, [user]);

  useEffect(() => {
    if (activeSecondaryAnalysisId && !secondaryAnalysis.files.length) {
      dispatch(loadSecondaryAnalysisFiles(activeSecondaryAnalysisId));
    }
  }, [activeSecondaryAnalysisId]);

  const onNext = () => {
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const onBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleUpdateSecondaryAnalysisDetails = () => {
    if (Object.keys(secondaryAnalysisDetailsDiff).length) {
      dispatch(updateSecondaryAnalysis(activeSecondaryAnalysisId, secondaryAnalysisDetailsDiff));
      setNewSecondaryAnalysisDetailsDiff({});
    }
  };

  const mainScreenDetails = (detailsObj) => {
    const view = Object.keys(detailsObj).map((key) => {
      const value = detailsObj[key];
      const title = keyToTitle[key];
      return (
        <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
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
  const mainScreenFileDetails = () => (
    <Empty
      description='Not uploaded'
    />
  );

  const {
    numOfSamples, numOfSublibraries, chemistryVersion, kit, refGenome,
  } = secondaryAnalysis || {};
  const secondaryAnalysisWizardSteps = [
    {
      title: 'Provide the details of the experimental setup:',
      key: 'Experimental setup',
      render: () => (
        <SecondaryAnalysisDetails
          onDetailsChanged={setNewSecondaryAnalysisDetailsDiff}
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
      onNext: () => { handleUpdateSecondaryAnalysisDetails(); onNext(); },
    },
    {
      title: 'Upload your sample loading table:',
      key: 'Sample loading table',
      render: () => <SampleLTUpload />,
      isValid: false,
      renderMainScreenDetails: mainScreenFileDetails,
      onNext,
    },
    {
      title: 'Reference genome',
      key: 'Reference genome',
      render: () => (
        <SelectReferenceGenome
          onDetailsChanged={setNewSecondaryAnalysisDetailsDiff}
          secondaryAnalysis={secondaryAnalysis}
        />
      ),
      isValid: Boolean(refGenome),
      renderMainScreenDetails: () => mainScreenDetails({ refGenome }),
      onNext: () => { handleUpdateSecondaryAnalysisDetails(); onNext(); },
    },
    {
      title: 'Upload your Fastq files:',
      key: 'Fastq files',
      render: () => <UploadFastQ secondaryAnalysisId={activeSecondaryAnalysisId} />,
      isValid: false,
      renderMainScreenDetails: mainScreenFileDetails,
      onNext,
    },
  ];
  const onCancel = () => { setCurrentStepIndex(null); };

  const currentStep = secondaryAnalysisWizardSteps[currentStepIndex];
  const PROJECTS_LIST = 'Runs';
  const PROJECT_DETAILS = 'Run Details';
  const TILE_MAP = {
    [PROJECTS_LIST]: {
      toolbarControls: [],
      component: (width, height) => (
        <ProjectsListContainer
          height={height}
          projectType='secondaryAnalyses'
          onCreateNewProject={() => setNewProjectModalVisible(true)}
        />
      ),
    },
    [PROJECT_DETAILS]: {
      toolbarControls: [],
      component: () => (
        <div style={{
          display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
        }}
        >
          {activeSecondaryAnalysisId ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space direction='vertical'>
                  <Title level={4}>{secondaryAnalysis.name}</Title>
                  <Text type='secondary'>
                    {`Run ID: ${activeSecondaryAnalysisId}`}
                  </Text>
                </Space>
                {/* todo - tooltip needs to be shown only if the button is disabled */}
                <Tooltip
                  overlay='Ensure that all sections are completed in order to proceed with running the pipeline.'
                  placement='left'
                >
                  <Button
                    type='primary'
                    disabled
                    size='large'
                    style={{ marginBottom: '10px' }}
                  >
                    Run the pipeline
                  </Button>
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
                />
              </div>
            </>
          ) : (
            <Empty description='Create a new run to get started' />
          )}
        </div>
      ),
    },
  };
  const windows = {
    direction: 'row',
    first: PROJECTS_LIST,
    second: PROJECT_DETAILS,
    splitPercentage: 23,
  };

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
      ) }
      {currentStep && (
        <Modal
          open
          title={currentStep.title}
          okButtonProps={{ htmlType: 'submit' }}
          bodyStyle={{ minHeight: '35dvh' }}
          onCancel={() => { onCancel(); handleUpdateSecondaryAnalysisDetails(); }}
          footer={[
            <Button key='back' onClick={onBack} style={{ display: currentStepIndex > 0 ? 'inline' : 'none' }}>
              Back
            </Button>,
            <Button key='submit' type='primary' onClick={currentStep.onNext}>
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
