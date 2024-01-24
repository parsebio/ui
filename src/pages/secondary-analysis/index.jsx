import React, { useState } from 'react';
import {
  Modal,
} from 'antd';
import Header from 'components/Header';
import NewSecondaryProject from 'components/secondary-analysis/NewSecondaryProject';
import SampleLTUpload from 'components/secondary-analysis/SampleLTUpload';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';
import UploadFastQ from 'components/secondary-analysis/UploadFastQ';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';

const SecondaryAnalysis = () => {
  const [currentStep, setCurrentStep] = useState('createProject');

  const onNext = () => setCurrentStep(secondaryAnalaysisWizardSteps[currentStep].nextStep);
  const onCancel = () => setCurrentStep('overviewMenu');
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
      nextStep: 'overviewMenu',
    },
  };

  return (
    <>
      <Header title='Secondary Analysis' />
      {currentStep === 'overviewMenu' ? <OverviewMenu wizardSteps={secondaryAnalaysisWizardSteps} setCurrentStep={setCurrentStep} /> : (
        <Modal
          title={secondaryAnalaysisWizardSteps[currentStep].title}
          open
          onOk={onNext}
          onCancel={onCancel}
          okText='Next'
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          {secondaryAnalaysisWizardSteps[currentStep].render()}
        </Modal>
      )}

    </>
  );
};

export default SecondaryAnalysis;
