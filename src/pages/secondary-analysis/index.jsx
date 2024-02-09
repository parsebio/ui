import React, { useState } from 'react';
import {
  Modal,
} from 'antd';
import Header from 'components/Header';
import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import NewSecondaryProject from 'components/secondary-analysis/NewSecondaryProject';
import SampleLTUpload from 'components/secondary-analysis/SampleLTUpload';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';
import UploadFastQ from 'components/secondary-analysis/UploadFastQ';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';
import MultiTileContainer from 'components/MultiTileContainer';

const SecondaryAnalysis = () => {
  const [currentStep, setCurrentStep] = useState('createProject');

  const onNext = () => setCurrentStep(secondaryAnalaysisWizardSteps[currentStep].nextStep);
  const onCancel = () => setCurrentStep(null);
  const secondaryAnalaysisWizardSteps = {
    createProject: {
      render: () => <NewSecondaryProject onNext={onNext} onCancel={onCancel} />,
      title: 'Experiment details',
      nextStep: 'uploadSampleLT',
    },
    uploadSampleLT: {
      render: () => <SampleLTUpload onNext={onNext} onCancel={onCancel} />,
      title: 'Sample loading table',
      nextStep: 'selectReferenceGenome',
    },
    selectReferenceGenome: {
      render: () => <SelectReferenceGenome onNext={onNext} onCancel={onCancel} />,
      title: 'Reference genome',
      nextStep: 'fastQUpload',
    },
    fastQUpload: {
      render: () => <UploadFastQ onNext={onNext} onCancel={onCancel} />,
      title: 'Fastq files',
      nextStep: null,
    },
  };
  const PROJECTS_LIST = 'Runs';
  const PROJECT_DETAILS = 'Run Details';
  const TILE_MAP = {
    [PROJECTS_LIST]: {
      toolbarControls: [],
      component: (width, height) => (
        <ProjectsListContainer
          height={height}
          onCreateNewProject={() => setCurrentStep('createProject')}
        />
      ),
    },
    [PROJECT_DETAILS]: {
      toolbarControls: [],
      component: (width, height) => (
        <OverviewMenu wizardSteps={secondaryAnalaysisWizardSteps} setCurrentStep={setCurrentStep} />
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
        title={secondaryAnalaysisWizardSteps[currentStep]?.title}
        onOk={onNext}
        onCancel={onCancel}
        okText={currentStep === 'createProject' ? 'Create' : 'Next'}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        {secondaryAnalaysisWizardSteps[currentStep]?.render()}
      </Modal>
      <MultiTileContainer
        tileMap={TILE_MAP}
        initialArrangement={windows}
      />
    </>
  );
};

export default SecondaryAnalysis;
