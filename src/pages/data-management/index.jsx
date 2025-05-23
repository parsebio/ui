import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadExperiments, createExperiment } from 'redux/actions/experiments';

import MultiTileContainer from 'components/MultiTileContainer';
import ProjectsListContainer from 'components/data-management/project/ProjectsListContainer';
import ProjectDetails from 'components/data-management/project/ProjectDetails';
import { loadProcessingSettings } from 'redux/actions/experimentSettings';
import loadBackendStatus from 'redux/actions/backendStatus/loadBackendStatus';
import { loadSamples } from 'redux/actions/samples';
import ExampleExperimentsSpace from 'components/data-management/ExampleExperimentsSpace';
import Loader from 'components/Loader';
import termsOfUseNotAccepted from 'utils/termsOfUseNotAccepted';
import NewProjectModal from 'components/data-management/project/NewProjectModal';

const DataManagementPage = () => {
  const dispatch = useDispatch();

  const samples = useSelector((state) => state.samples);

  const { activeExperimentId } = useSelector((state) => state.experiments.meta);
  const experiments = useSelector(((state) => state.experiments));
  const user = useSelector((state) => state.user.current);

  const activeExperiment = experiments[activeExperimentId];
  const domainName = useSelector((state) => state.networkResources?.domainName);

  const [NewProjectModalVisible, setNewProjectModalVisible] = useState(false);

  useEffect(() => {
    if (termsOfUseNotAccepted(user, domainName)) return;

    if (experiments.ids.length === 0) dispatch(loadExperiments());
  }, [user]);

  const samplesAreLoaded = () => {
    const loadedSampleIds = Object.keys(samples);
    return activeExperiment.sampleIds.every((sampleId) => loadedSampleIds.includes(sampleId));
  };

  useEffect(() => {
    // If the active experiment isnt loaded, reload
    if (activeExperimentId && !activeExperiment) {
      dispatch(loadExperiments());
    }
  }, [activeExperiment]);

  useEffect(() => {
    if (!activeExperimentId
      || !activeExperiment
      || termsOfUseNotAccepted(user, domainName)
    ) return;

    dispatch(loadProcessingSettings(activeExperimentId));

    if (!samplesAreLoaded()) dispatch(loadSamples(activeExperimentId));

    dispatch(loadBackendStatus(activeExperimentId));
  }, [activeExperimentId, activeExperiment, user]);

  const PROJECTS_LIST = 'Projects';
  const PROJECT_DETAILS = 'Project Details';

  const projectsListRenderer = useCallback((width, height) => (
    <ProjectsListContainer
      height={height}
      projectType='experiments'
      onCreateNewProject={() => setNewProjectModalVisible(true)}
    />
  ), []);

  const projectDetailsRenderer = useCallback((width, height) => {
    if (!activeExperimentId) {
      return <ExampleExperimentsSpace introductionText='You have no projects yet.' />;
    }

    if (!activeExperiment) {
      return (
        <center>
          <Loader />
        </center>
      );
    }

    return (
      <ProjectDetails
        width={width}
        height={height}
      />
    );
  }, [activeExperimentId, activeExperiment]);

  const TILE_MAP = {
    [PROJECTS_LIST]: {
      toolbarControls: [],
      component: projectsListRenderer,
    },
    [PROJECT_DETAILS]: {
      toolbarControls: [],
      component: projectDetailsRenderer,
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
      {NewProjectModalVisible ? (
        <NewProjectModal
          projectType='experiments'
          onCancel={() => { setNewProjectModalVisible(false); }}
          onCreate={async (name, description) => {
            await dispatch(createExperiment(name, description));
            setNewProjectModalVisible(false);
          }}
        />
      ) : null}
      <MultiTileContainer
        tileMap={TILE_MAP}
        initialArrangement={windows}
      />
    </>
  );
};

export default DataManagementPage;
