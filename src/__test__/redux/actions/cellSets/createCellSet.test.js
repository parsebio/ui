import _ from 'lodash';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import createCellSet from 'redux/actions/cellSets/createCellSet';
import initialState from 'redux/reducers/cellSets/initialState';

import uuid from 'uuid';

import '__test__/test-utils/setupTests';
import { getMockedInfoState } from '__test__/test-utils/setMockedExperimentInfo';

enableFetchMocks();

jest.mock('uuid', () => jest.fn());
uuid.v4 = jest.fn(() => 'some-uuid');

const mockStore = configureStore([thunk]);

describe('createCellSet action', () => {
  const experimentId = '1234';

  const cellSet = {
    name: 'one', color: '#ff0000', cellIds: new Set([1, 2, 3]),
  };

  const baseState = {
    experimentSettings: { info: getMockedInfoState(experimentId) },
  };

  beforeEach(() => {
    const response = new Response(JSON.stringify({}));

    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockResolvedValueOnce(response);
  });

  it('Does not dispatch on loading state', async () => {
    const store = mockStore({ ...baseState, cellSets: { loading: true, error: false } });
    await store.dispatch(createCellSet(experimentId, cellSet.name, cellSet.color, cellSet.cellIds));
    expect(store.getActions().length).toEqual(0);
  });

  it('Does not dispatch on error state', async () => {
    const store = mockStore({ ...baseState, cellSets: { loading: false, error: true } });
    await store.dispatch(createCellSet(experimentId, cellSet.name, cellSet.color, cellSet.cellIds));
    expect(store.getActions().length).toEqual(0);
  });

  it('Dispatches an action to create cell set to the reducer', async () => {
    const store = mockStore({ ...baseState, cellSets: { ...initialState, loading: false } });
    await store.dispatch(createCellSet(experimentId, cellSet.name, cellSet.color, cellSet.cellIds));

    const firstAction = store.getActions()[0];
    firstAction.payload.key = 'a key';
    expect(firstAction).toMatchSnapshot();
  });

  it('Sends fetch to the API when creating cell set', async () => {
    const store = mockStore({ ...baseState, cellSets: { ...initialState, loading: false } });
    await store.dispatch(createCellSet(experimentId, cellSet.name, cellSet.color, cellSet.cellIds));

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, body] = fetch.mock.calls[0];

    expect(url).toEqual('http://localhost:3000/v2/experiments/1234/cellSets');
    expect(body).toMatchSnapshot();
  });

  it('Uses V2 URL when using API version V2', async () => {
    const store = mockStore({ ...baseState, cellSets: { ...initialState, loading: false } });
    await store.dispatch(createCellSet(experimentId, cellSet.name, cellSet.color, cellSet.cellIds));

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, body] = fetch.mock.calls[0];

    expect(url).toEqual('http://localhost:3000/v2/experiments/1234/cellSets');
    expect(body).toMatchSnapshot();
  });

  it('Skips when trying to run with a non-owner permission', async () => {
    const state = _.cloneDeep({ ...baseState, cellSets: { ...initialState, loading: false } });
    state.experimentSettings.info.accessRole = 'viewer';

    const store = mockStore(state);
    await store.dispatch(createCellSet(experimentId, cellSet.name, cellSet.color, cellSet.cellIds));

    expect(fetchMock).toHaveBeenCalledTimes(0);
  });
});
