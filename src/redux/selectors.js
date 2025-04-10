/* eslint-disable import/prefer-default-export */

// Accumulates all the different selectors

import * as backendSelectors from './selectors/backendStatus';
import * as cellSetsSelectors from './selectors/cellSets';
import * as genesSelectors from './selectors/genes';
import * as componentConfigSelectors from './selectors/componentConfig';
import * as secondaryAnalysesSelectors from './selectors/secondaryAnalyses';
import * as experimentSettingsSelectors from './selectors/experimentSettings';
import * as samplesSelectors from './selectors/samples';
import * as selectors from './selectors';

const getBackendStatus = (...params) => (state) => (
  backendSelectors.getBackendStatus(...params)(state.backendStatus));

const getCellSets = (...params) => (state) => (
  cellSetsSelectors.getCellSets(...params)(state.cellSets));

const getCellSetsHierarchy = (...params) => (state) => (
  cellSetsSelectors.getCellSetsHierarchy(...params)(state.cellSets));

const getCellSetsHierarchyByType = (...params) => (state) => (
  cellSetsSelectors.getCellSetsHierarchyByType(...params)(state.cellSets));

const getCellSetsHierarchyByKeys = (...params) => (state) => (
  cellSetsSelectors.getCellSetsHierarchyByKeys(...params)(state.cellSets));

const getFilteredCellIds = (...params) => (state) => (
  cellSetsSelectors.getFilteredCellIds(...params)(state.cellSets));

const getPlotConfigs = (...params) => (state) => (
  componentConfigSelectors.getPlotConfigs(...params)(state.componentConfig));

const getGeneList = (...params) => (state) => (
  genesSelectors.getGeneList(...params)(state.genes));

const getFastqFiles = (...params) => (state) => (
  secondaryAnalysesSelectors.getFastqFiles(...params)(state.secondaryAnalyses)
);

const getSampleLTFile = (...params) => (state) => (
  secondaryAnalysesSelectors.getSampleLTFile(...params)(state.secondaryAnalyses)
);

const getSelectedMetadataTracks = (...params) => (state) => (
  componentConfigSelectors.getSelectedMetadataTracks(...params)(state)
);

const getFilterChanges = (...params) => (state) => (
  experimentSettingsSelectors.getFilterChanges(...params)(state.experimentSettings)
);

const getAnalysisTool = (...params) => (state) => (
  experimentSettingsSelectors.getAnalysisTool(...params)(state.experimentSettings)
);

const getIsScanpy = (...params) => (state) => (
  experimentSettingsSelectors.getIsScanpy(...params)(state.experimentSettings)
);

const getMetadataToSampleIds = (...params) => (state) => (
  samplesSelectors.getMetadataToSampleIds(...params)(state.samples)
);

const getSamples = (...params) => (state) => (
  samplesSelectors.getSamples(...params)(state.samples)
);

const getCanAccess = (...params) => (state) => (
  selectors.getCanAccess(...params)(state)
);

export {
  getBackendStatus,
  getCellSets,
  getCellSetsHierarchy,
  getCellSetsHierarchyByType,
  getCellSetsHierarchyByKeys,
  getFilteredCellIds,
  getPlotConfigs,
  getGeneList,
  getFastqFiles,
  getSampleLTFile,
  getSelectedMetadataTracks,
  getFilterChanges,
  getAnalysisTool,
  getIsScanpy,
  getMetadataToSampleIds,
  getSamples,
  getCanAccess,
};
