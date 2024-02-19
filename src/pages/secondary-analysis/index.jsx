import React, { useState, useEffect } from 'react';
import {
  Modal, Button, Empty, Typography,
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
import { loadSecondaryAnalyses, updateSecondaryAnalysis, createSecondaryAnalysis } from 'redux/actions/secondaryAnalyses';
import EditableParagraph from 'components/EditableParagraph';

const { Text } = Typography;

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
  const {
    numOfSamples, numOfSublibraries, chemistryVersion, kit, refGenome,
  } = secondaryAnalysis || {};
  const secondaryAnalysisWizardSteps = [
    {
      title: 'Provide the Run details:',
      key: 'Run details',
      render: () => (
        <SecondaryAnalysisDetails
          onDetailsChanged={setNewSecondaryAnalysisDetailsDiff}
          secondaryAnalysis={secondaryAnalysis}
        />
      ),
      isValid: (numOfSamples && numOfSublibraries && chemistryVersion && kit),
      onNext: () => { handleUpdateSecondaryAnalysisDetails(); onNext(); },
    },
    {
      title: 'Upload your sample loading table:',
      key: 'Sample loading table',
      render: () => <SampleLTUpload />,
      isValid: false,
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
      onNext: () => { handleUpdateSecondaryAnalysisDetails(); onNext(); },
    },
    {
      title: 'Upload your Fastq files:',
      key: 'Fastq files',
      render: () => <UploadFastQ />,
      isValid: false,
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
      component: () => (activeSecondaryAnalysisId ? (
        <>
          {' '}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Text strong>
              Description:
            </Text>
            <EditableParagraph
              value={secondaryAnalysis.description}
              onUpdate={(text) => {
                if (text !== secondaryAnalysis.description) {
                  dispatch(updateSecondaryAnalysis(activeSecondaryAnalysisId, { description: text }));
                }
              }}
            />
          </div>
          <OverviewMenu
            wizardSteps={secondaryAnalysisWizardSteps}
            setCurrentStep={setCurrentStepIndex}
            title={secondaryAnalysis.name}
          />

        </>
      )
        : <Empty description='Create a new run to get started' />),
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
          bodyStyle={{ height: '35vh' }}
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
