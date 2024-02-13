import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import Header from 'components/Header';
import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import NewSecondaryProject from 'components/secondary-analysis/NewSecondaryProject';
import SampleLTUpload from 'components/secondary-analysis/SampleLTUpload';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';
import UploadFastQ from 'components/secondary-analysis/UploadFastQ';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';
import MultiTileContainer from 'components/MultiTileContainer';

const SecondaryAnalysis = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const secondaryAnalysisWizardSteps = [
    {
      key: 'Run details',
      render: () => <NewSecondaryProject />,
      title: 'Create a new Run and provide the Run details:',
    },
    {
      key: 'Sample loading table',
      render: () => <SampleLTUpload />,
      title: 'Upload your sample loading table:',
    },
    {
      key: 'Reference genome',
      render: () => <SelectReferenceGenome />,
      title: 'Reference genome',
    },
    {
      key: 'Fastq files',
      render: () => <UploadFastQ />,
      title: 'Upload your Fastq files:',
    },
  ];

  const onNext = () => {
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const onBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const onCancel = () => setCurrentStepIndex(-1); // Use -1 to indicate no step is active

  const currentStep = secondaryAnalysisWizardSteps[currentStepIndex];
  const PROJECTS_LIST = 'Runs';
  const PROJECT_DETAILS = 'Run Details';
  const TILE_MAP = {
    [PROJECTS_LIST]: {
      toolbarControls: [],
      component: (width, height) => (
        <ProjectsListContainer
          height={height}
          projectType='secondary'
          onCreateNewProject={() => setCurrentStepIndex(0)}
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

      <Modal
        open={currentStep}
        title={currentStep?.title}
        onOk={onNext}
        bodyStyle={{ height: '38vh' }}
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
