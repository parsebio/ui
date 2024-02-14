import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'antd';
import Header from 'components/Header';
import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import SecondaryAnalysisDetails from 'components/secondary-analysis/SecondaryAnalysisDetails';
import SampleLTUpload from 'components/secondary-analysis/SampleLTUpload';
import { useSelector, useDispatch } from 'react-redux';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';
import UploadFastQ from 'components/secondary-analysis/UploadFastQ';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';
import MultiTileContainer from 'components/MultiTileContainer';
import NewSecondaryAnalysis from 'components/secondary-analysis/NewSecondaryAnalysis';
import loadSecondaryAnalyses from 'redux/actions/secondaryAnalyses/loadSecondaryAnalyses';

const SecondaryAnalysis = () => {
  const dispatch = useDispatch();
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [newProjectDetails, setNewProjectDetails] = useState({});
  const [NewSecondaryAnalysisModalVisible, setNewSecondaryAnalysisModalVisible] = useState(false);
  const user = useSelector((state) => state.user.current);

  const secondaryAnalyses = useSelector((state) => state.secondaryAnalyses);

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
  const handleCreateNewProject = () => {
    // make it patch to the created analysis
    // const {
    //   name, kit, chemistryVersion, numOfSamples, numOfSublibraries,
    // } = newProjectDetails;
    // console.log('PROJECT DETAILS ', newProjectDetails);
    // dispatch(createSecondaryAnalysis(name, kit, chemistryVersion, numOfSamples, numOfSublibraries));
    onNext();
  };
  const secondaryAnalysisWizardSteps = [
    {
      title: 'Create a new Run and provide the Run details:',
      key: 'Run details',
      render: () => <SecondaryAnalysisDetails newProjectDetails={newProjectDetails} setNewProjectDetails={setNewProjectDetails} />,
      onNext: handleCreateNewProject,
    },
    {
      title: 'Upload your sample loading table:',
      key: 'Sample loading table',
      render: () => <SampleLTUpload />,
      onNext,
    },
    {
      title: 'Reference genome',
      key: 'Reference genome',
      render: () => <SelectReferenceGenome />,
      onNext,
    },
    {
      title: 'Upload your Fastq files:',
      key: 'Fastq files',
      render: () => <UploadFastQ />,
      onNext,
    },
  ];
  const onCancel = () => setCurrentStepIndex(null);

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
          onCreateNewProject={() => setNewSecondaryAnalysisModalVisible(true)}
        />
      ),
    },
    [PROJECT_DETAILS]: {
      toolbarControls: [],
      component: (width, height) => (
        <OverviewMenu wizardSteps={secondaryAnalysisWizardSteps} setCurrentStep={setCurrentStepIndex} />
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
      {NewSecondaryAnalysisModalVisible ? (
        <NewSecondaryAnalysis
          onCancel={() => { setNewSecondaryAnalysisModalVisible(false); }}
          onCreate={() => { setNewSecondaryAnalysisModalVisible(false); setCurrentStepIndex(0); }}
        />
      ) : (<></>)}

      <Modal
        open={currentStep}
        title={currentStep?.title}
        // onOk={currentStep.onNext}
        okButtonProps={{ htmlType: 'submit' }}
        bodyStyle={{ height: '38vh' }}
        onCancel={onCancel}
        footer={[
          <Button key='back' onClick={onBack} style={{ display: currentStepIndex > 0 ? 'inline' : 'none' }}>
            Back
          </Button>,
          <Button key='submit' type='primary' onClick={currentStep?.onNext}>
            {currentStepIndex === secondaryAnalysisWizardSteps.length - 1 ? 'Finish' : 'Next'}
          </Button>,
        ]}
      >

        {currentStep?.render()}
      </Modal>
      <MultiTileContainer
        tileMap={TILE_MAP}
        initialArrangement={windows}
      />
    </>
  );
};

export default SecondaryAnalysis;
