import _ from 'lodash';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import waitForActions from 'redux-mock-store-await-actions';

import loadBackendStatus from 'redux/actions/backendStatus/loadBackendStatus';
import saveProcessingSettings from 'redux/actions/experimentSettings/processingConfig/saveProcessingSettings';

import {
  EXPERIMENT_SETTINGS_QC_START,
  EXPERIMENT_SETTINGS_DISCARD_CHANGED_QC_FILTERS,
} from 'redux/actionTypes/experimentSettings';

import { CELL_SETS_CLUSTERING_UPDATING } from 'redux/actionTypes/cellSets';

import { EMBEDDINGS_LOADING } from 'redux/actionTypes/embeddings';

import { runQC } from 'redux/actions/pipeline';

import generateExperimentSettingsMock from '__test__/test-utils/experimentSettings.mock';
import '__test__/test-utils/setupTests';
import { analysisTools } from 'utils/constants';

jest.mock('utils/getTimeoutForWorkerTask', () => () => 1);

jest.mock('redux/actions/backendStatus/loadBackendStatus',
  () => jest.fn().mockImplementation(() => async () => { }));

jest.mock('redux/actions/experimentSettings/processingConfig/saveProcessingSettings');

const mockStore = configureStore([thunk]);

enableFetchMocks();

const experimentId = 'experiment-id';
const sampleIds = ['sample1', 'sample2'];

const initialExperimentState = generateExperimentSettingsMock(sampleIds);

const initialState = {
  experimentSettings: {
    ...initialExperimentState,
    processing: {
      ...initialExperimentState.processing,
      meta: {
        changedQCFilters: new Set(['cellSizeDistribution']),
      },
    },
  },
  cellSets: {},
  backendStatus: {
    [experimentId]: {
      status: {
        pipeline: {
          startDate: '2021-01-01T01:01:01.000Z',
        },
      },
    },
  },
  networkResources: {
    environment: 'testing',
  },
};

describe('runQC action', () => {
  beforeEach(() => {
    const response = new Response(JSON.stringify({}));

    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockResolvedValueOnce(response);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Dispatches events properly', async () => {
    const store = mockStore(initialState);
    await store.dispatch(runQC(experimentId));

    const actions = store.getActions();

    expect(actions[0].type).toEqual(EXPERIMENT_SETTINGS_QC_START);
    expect(loadBackendStatus).toHaveBeenCalled();
    expect(actions).toMatchSnapshot();

    expect(fetchMock.mock.calls[0]).toMatchSnapshot();
  });

  it('Dispatches status error if loading fails', async () => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(
      JSON.stringify({ message: 'some weird error that happened' }), { status: 400 },
    );

    const store = mockStore(initialState);
    await store.dispatch(runQC(experimentId));

    const actions = store.getActions();

    expect(loadBackendStatus).toHaveBeenCalled();

    expect(actions).toMatchSnapshot();
  });

  it('Runs only the embedding if only changed filter was embeddingSettings', async () => {
    fetchMock.resetMocks();

    saveProcessingSettings.mockImplementation(() => () => Promise.resolve());

    const onlyEmbeddingSettingsChangedState = _.cloneDeep(initialState);
    onlyEmbeddingSettingsChangedState.experimentSettings.processing.meta.changedQCFilters = new Set(['configureEmbedding']);

    // Make sure the methods differ
    onlyEmbeddingSettingsChangedState.experimentSettings.processing.configureEmbedding.embeddingSettings.method = 'tsne';
    onlyEmbeddingSettingsChangedState.experimentSettings.originalProcessing.configureEmbedding.embeddingSettings.method = 'umap';

    const store = mockStore(onlyEmbeddingSettingsChangedState);
    await store.dispatch(runQC(experimentId));

    await waitForActions(
      store,
      [EXPERIMENT_SETTINGS_DISCARD_CHANGED_QC_FILTERS, EMBEDDINGS_LOADING],
    );

    const actions = store.getActions();

    expect(actions[0].type).toEqual(EXPERIMENT_SETTINGS_DISCARD_CHANGED_QC_FILTERS);
    expect(actions[1].type).toEqual(EMBEDDINGS_LOADING);

    expect(actions).toMatchSnapshot();
  });

  it('Scanpy runs qc even if only changed filter was embeddingSettings', async () => {
    saveProcessingSettings.mockImplementation(() => () => Promise.resolve());

    const onlyEmbeddingSettingsChangedState = _.cloneDeep(initialState);
    onlyEmbeddingSettingsChangedState.experimentSettings.processing.meta.changedQCFilters = new Set(['configureEmbedding']);

    // Make sure the methods differ
    onlyEmbeddingSettingsChangedState.experimentSettings.processing.configureEmbedding.embeddingSettings.method = 'tsne';
    onlyEmbeddingSettingsChangedState.experimentSettings.originalProcessing.configureEmbedding.embeddingSettings.method = 'umap';

    // Make it scanpy
    onlyEmbeddingSettingsChangedState.experimentSettings.processing.dataIntegration
      .analysisTool = analysisTools.SCANPY;

    const store = mockStore(onlyEmbeddingSettingsChangedState);
    await store.dispatch(runQC(experimentId));

    await waitForActions(
      store,
      [EXPERIMENT_SETTINGS_QC_START],
    );

    const actions = store.getActions();
    expect(_.map(actions, 'type')).toEqual([EXPERIMENT_SETTINGS_QC_START]);

    expect(actions).toMatchSnapshot();

    expect(fetchMock.mock.calls[0]).toMatchSnapshot();
  });

  it('Runs only clustering if only changed filter was clusteringSettings', async () => {
    fetchMock.resetMocks();

    saveProcessingSettings.mockImplementation(() => () => Promise.resolve());

    const onlyClusteringSettingsChangedState = _.cloneDeep(initialState);
    onlyClusteringSettingsChangedState.experimentSettings.processing.meta.changedQCFilters = new Set(['configureEmbedding']);

    // Make sure the methods differ
    onlyClusteringSettingsChangedState.experimentSettings.processing.configureEmbedding.clusteringSettings.method = 'leiden';
    onlyClusteringSettingsChangedState.experimentSettings.originalProcessing.configureEmbedding.clusteringSettings.method = 'louvain';

    const store = mockStore(onlyClusteringSettingsChangedState);
    await store.dispatch(runQC(experimentId));

    await waitForActions(
      store,
      [EXPERIMENT_SETTINGS_DISCARD_CHANGED_QC_FILTERS, CELL_SETS_CLUSTERING_UPDATING],
    );

    const actions = store.getActions();

    expect(actions[0].type).toEqual(EXPERIMENT_SETTINGS_DISCARD_CHANGED_QC_FILTERS);
    expect(actions[1].type).toEqual(CELL_SETS_CLUSTERING_UPDATING);

    expect(actions).toMatchSnapshot();
  });

  it('Scanpy runs qc even if only changed filter was clusteringSettings', async () => {
    saveProcessingSettings.mockImplementation(() => () => Promise.resolve());

    const onlyClusteringSettingsChangedState = _.cloneDeep(initialState);
    onlyClusteringSettingsChangedState.experimentSettings.processing.meta.changedQCFilters = new Set(['configureEmbedding']);

    // Make sure the methods differ
    onlyClusteringSettingsChangedState.experimentSettings.processing.configureEmbedding.clusteringSettings.method = 'leiden';
    onlyClusteringSettingsChangedState.experimentSettings.originalProcessing.configureEmbedding.clusteringSettings.method = 'louvain';

    // Make it scanpy
    onlyClusteringSettingsChangedState.experimentSettings.processing.dataIntegration
      .analysisTool = analysisTools.SCANPY;

    const store = mockStore(onlyClusteringSettingsChangedState);
    await store.dispatch(runQC(experimentId));

    await waitForActions(
      store,
      [EXPERIMENT_SETTINGS_QC_START],
    );

    const actions = store.getActions();
    expect(_.map(actions, 'type')).toEqual([EXPERIMENT_SETTINGS_QC_START]);

    expect(actions).toMatchSnapshot();

    expect(fetchMock.mock.calls[0]).toMatchSnapshot();
  });

  it('Triggers qc correctly when previous qc failed', async () => {
    const qcFailedState = _.cloneDeep(initialState);

    qcFailedState.experimentSettings.processing.meta.changedQCFilters = new Set();
    qcFailedState.backendStatus[experimentId].status.pipeline.status = 'FAILED';
    qcFailedState.backendStatus[experimentId].status.pipeline.error = true;

    const store = mockStore(qcFailedState);
    await store.dispatch(runQC(experimentId));

    const actions = store.getActions();

    expect(actions[0].type).toEqual(EXPERIMENT_SETTINGS_QC_START);
    expect(loadBackendStatus).toHaveBeenCalled();
    expect(actions).toMatchSnapshot();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/v2/experiments/${experimentId}/qc`),
      expect.objectContaining({ body: JSON.stringify({ processingConfigDiff: {} }) }),
    );
    expect(fetchMock.mock.calls[0]).toMatchSnapshot();
  });

  it('Triggers qc correctly when an error happened and running with changes in a filter step', async () => {
    const qcFailedState = _.cloneDeep(initialState);

    qcFailedState.experimentSettings.processing.meta.changedQCFilters = new Set(['cellSizeDistribution']);
    qcFailedState.backendStatus[experimentId].status.pipeline.status = 'FAILED';
    qcFailedState.backendStatus[experimentId].status.pipeline.error = true;

    const store = mockStore(qcFailedState);
    await store.dispatch(runQC(experimentId));

    const actions = store.getActions();

    expect(actions[0].type).toEqual(EXPERIMENT_SETTINGS_QC_START);
    expect(loadBackendStatus).toHaveBeenCalled();
    expect(actions).toMatchSnapshot();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/v2/experiments/${experimentId}/qc`),
      expect.objectContaining({
        body: JSON.stringify({
          processingConfigDiff: {
            cellSizeDistribution: {
              sample1: {
                auto: true,
                enabled: true,
                filterSettings: {
                  minCellSize: 10800,
                  binStep: 200,
                },
              },
              sample2: {
                auto: true,
                enabled: true,
                filterSettings: {
                  minCellSize: 10800,
                  binStep: 200,
                },
              },
            },
          },
        }),
      }),
    );
    expect(fetchMock.mock.calls[0]).toMatchSnapshot();
  });

  it('Triggers qc correctly when an error happened and running with changes in configureEmbedding', async () => {
    const qcFailedState = _.cloneDeep(initialState);

    // Make sure the methods differ
    qcFailedState.experimentSettings.processing.configureEmbedding.clusteringSettings.method = 'leiden';
    qcFailedState.experimentSettings.originalProcessing.configureEmbedding.clusteringSettings.method = 'louvain';

    qcFailedState.experimentSettings.processing.meta.changedQCFilters = new Set(['configureEmbedding']);
    qcFailedState.backendStatus[experimentId].status.pipeline.status = 'FAILED';
    qcFailedState.backendStatus[experimentId].status.pipeline.error = true;

    const store = mockStore(qcFailedState);
    await store.dispatch(runQC(experimentId));

    const actions = store.getActions();

    expect(actions[0].type).toEqual(EXPERIMENT_SETTINGS_QC_START);
    expect(loadBackendStatus).toHaveBeenCalled();
    expect(actions).toMatchSnapshot();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/v2/experiments/${experimentId}/qc`),
      expect.objectContaining({
        body: JSON.stringify({
          processingConfigDiff: {
            configureEmbedding: {
              enabled: true,
              embeddingSettings: {
                method: 'umap',
                useSaved: false,
                methodSettings: {
                  umap: {
                    minimumDistance: 0.1,
                    distanceMetric: 'euclidean',
                  },
                  tsne: {
                    perplexity: 30,
                    learningRate: 200,
                  },
                },
              },
              clusteringSettings: {
                method: 'leiden',
                methodSettings: {
                  louvain: {
                    resolution: 0.5,
                  },
                },
              },
            },
          },
        }),
      }),
    );
    expect(fetchMock.mock.calls[0]).toMatchSnapshot();
  });
});
