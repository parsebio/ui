import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import runCellSetsClustering from 'redux/actions/cellSets/runCellSetsClustering';

import initialState from 'redux/reducers/cellSets/initialState';
import fetchWork from 'utils/work/fetchWork';

enableFetchMocks();
const mockStore = configureStore([thunk]);

jest.mock('utils/work/fetchWork');

jest.mock('utils/getTimeoutForWorkerTask', () => ({
  __esModule: true, // this property makes it work
  default: () => 60,
}));

const startDate = '2021-01-01T00:00:00';

describe('runCellSetsClustering action', () => {
  const experimentId = '1234';

  const backendStatus = { [experimentId]: { status: { pipeline: { startDate } } } };
  const experimentSettingsStore = {
    processing: { configureEmbedding: { clusteringSettings: { method: 'louvain' } } },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const response = new Response(JSON.stringify({}));

    fetchMock.resetMocks();
    fetchMock.mockResolvedValueOnce(response);

    fetchWork.mockImplementation(() => Promise.resolve());
  });

  it('Does not dispatch on loading state if clustering is already recomputing', async () => {
    const store = mockStore({
      cellSets: { loading: true, error: false, updatingClustering: true },
      experimentSettings: experimentSettingsStore,
      backendStatus,
      networkResources: {
        environment: 'testing',
      },
    });

    store.dispatch(runCellSetsClustering(experimentId));
  });

  it('Does dispatch on loading state if clustering is not recomputing', async () => {
    const store = mockStore({
      cellSets: { loading: true, error: false, updatingClustering: false },
      experimentSettings: experimentSettingsStore,
      backendStatus,
      networkResources: {
        environment: 'testing',
      },
    });

    await store.dispatch(runCellSetsClustering(experimentId));
    expect(fetchWork).toHaveBeenCalledTimes(1);
  });

  it('Does not dispatch on error state', async () => {
    const store = mockStore({
      cellSets: { loading: false, error: true },
      experimentSettings: experimentSettingsStore,
      backendStatus,
      networkResources: {
        environment: 'testing',
      },
    });
    await store.dispatch(runCellSetsClustering(experimentId));
    expect(fetchWork).not.toHaveBeenCalled();
  });

  it('Dispatches all required actions to update cell sets clustering.', async () => {
    const store = mockStore({
      cellSets: {
        ...initialState,
        loading: false,
        error: false,
        hierarchy: [{ children: [], key: 'scratchpad' }],
        properties: {
          scratchpad: {
            cellIds: new Set(),
            color: undefined,
            name: 'Scratchpad',
            rootNode: true,
            type: 'cellSets',
          },
        },
      },
      experimentSettings: experimentSettingsStore,
      backendStatus,
      networkResources: {
        environment: 'testing',
      },
    });

    await store.dispatch(runCellSetsClustering(experimentId, 0.5));

    expect(fetchWork).toHaveBeenCalledTimes(1);
    expect(fetchWork.mock.calls).toMatchSnapshot();
  });

  it('Dispatches error action when fetchWork fails', async () => {
    const store = mockStore({
      cellSets: { ...initialState, loading: false, error: false },
      experimentSettings: experimentSettingsStore,
      backendStatus,
      networkResources: {
        environment: 'testing',
      },
    });

    fetchWork.mockImplementation(() => Promise.reject());

    await store.dispatch(runCellSetsClustering(experimentId, 0.5));

    expect(fetchWork).toHaveBeenCalledTimes(1);
    expect(fetchWork.mock.calls).toMatchSnapshot();
  });
});
