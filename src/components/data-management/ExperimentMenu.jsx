import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Space, Button, Tooltip,
} from 'antd';
import { useAppRouter } from 'utils/AppRouteProvider';
import { modules } from 'utils/constants';

import integrationTestConstants from 'utils/integrationTestConstants';
import processSampleUpload from 'utils/upload/processSampleUpload';
import DownloadDataButton from 'components/data-management/DownloadDataButton';
import LaunchAnalysisButton from 'components/data-management/LaunchAnalysisButton';
import FileUploadModal from 'components/data-management/FileUploadModal';
import ShareProjectModal from 'components/data-management/project/ShareProjectModal';

const ExperimentMenu = () => {
  const dispatch = useDispatch();
  const samples = useSelector((state) => state.samples);
  const activeExperimentId = useSelector((state) => state.experiments.meta.activeExperimentId);
  const activeExperiment = useSelector((state) => state.experiments[activeExperimentId]);
  const isSubsetted = activeExperiment?.isSubsetted;

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [shareExperimentModalVisible, setShareExperimentModalVisible] = useState(false);
  // change this last before releasing the parse 10x integration epic
  const selectedTech = samples[activeExperiment?.sampleIds[0]]?.type;

  const {
    secondaryAnalysisId: linkedSecondaryAnalysisId,
    isLatestSecondaryExecution,
  } = activeExperiment;

  const { navigateTo } = useAppRouter();
  const uploadFiles = (filesList, sampleType) => {
    processSampleUpload(filesList, sampleType, samples, activeExperimentId, dispatch);
    setUploadModalVisible(false);
  };

  return (
    <>
      <Space>
        <Button
          data-test-id={integrationTestConstants.ids.ADD_SAMPLES_BUTTON}
          onClick={() => setUploadModalVisible(true)}
          disabled={isSubsetted}
        >
          Add data
        </Button>
        <DownloadDataButton />
        <Button
          onClick={() => setShareExperimentModalVisible(!shareExperimentModalVisible)}
          disabled={activeExperimentId === 'c26b1fc8-e207-4a45-90ae-51b730617bee'}
        >
          Share
        </Button>
        {linkedSecondaryAnalysisId && (
          <div>
            <Tooltip
              title={!isLatestSecondaryExecution ? 'The pipeline run associated with this project is not available as the run has been overwritten by a more recent run with altered settings.' : `This Project was generated from a run in the Pipeline module of the platform.
              Click to view the results and reports from the associated
              pipeline run`}
              placement='top'
            >
              <Button
                disabled={!isLatestSecondaryExecution}
                type='primary'
                onClick={() => navigateTo(
                  modules.SECONDARY_ANALYSIS_OUTPUT,
                  { secondaryAnalysisId: linkedSecondaryAnalysisId },
                )}
              >
                Go to Pipeline Outputs
              </Button>
            </Tooltip>
          </div>
        )}
        {shareExperimentModalVisible && (
          <ShareProjectModal
            projectType='experiment'
            onCancel={() => setShareExperimentModalVisible(false)}
            project={activeExperiment}
          />
        )}
        <LaunchAnalysisButton />
      </Space>
      {uploadModalVisible ? (
        <FileUploadModal
          onUpload={uploadFiles}
          currentSelectedTech={selectedTech}
          onCancel={() => setUploadModalVisible(false)}
        />
      ) : null}
    </>
  );
};

export default ExperimentMenu;
