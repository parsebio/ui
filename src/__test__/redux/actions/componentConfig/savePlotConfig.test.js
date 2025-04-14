import { act } from 'react-dom/test-utils';

import '__test__/test-utils/mockWorkerBackend';

import pushNotificationMessage from 'utils/pushNotificationMessage';
import { savePlotConfig } from 'redux/actions/componentConfig';
import { initialPlotConfigStates } from 'redux/reducers/componentConfig/initialState';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import endUserMessages from 'utils/endUserMessages';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import fake from '__test__/test-utils/constants';
import setMockedExperimentInfo from '__test__/test-utils/setMockedExperimentInfo';
import { accessRoles } from 'redux/selectors/getHasPermissions';

jest.mock('utils/pushNotificationMessage');

const mockStore = configureMockStore([thunk]);

enableFetchMocks();

const experimentId = fake.EXPERIMENT_ID;
const plotUuid = 'cellSizeDistributionHistogramMain';
const plotType = 'cellSizeDistributionHistogram';

const state = {
  componentConfig: {
    [plotUuid]: {
      config: initialPlotConfigStates[plotType],
      plotData: [],
    },
  },
  experimentSettings: {
    info: {
      accessRole: accessRoles.OWNER,
    },
  },
};

const store = mockStore(state);

describe('savePlotConfig', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
  });

  it('Fires request to save config properly', async () => {
    await act(async () => {
      await store.dispatch(savePlotConfig(experimentId, plotUuid));
    });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toEqual(`http://localhost:3000/v2/experiments/${experimentId}/plots/${plotUuid}`);
  });

  it('Shows an error notification if saving fails', async () => {
    fetchMock.mockResponse(() => Promise.resolve({ status: 500, body: JSON.stringify('Server error') }));

    await act(async () => {
      await store.dispatch(savePlotConfig(experimentId, plotUuid));
    });

    // Expect componentConfig to contain key for plotUuid
    expect(pushNotificationMessage).toHaveBeenCalledTimes(1);
    expect(pushNotificationMessage).toHaveBeenCalledWith('error', endUserMessages.ERROR_SAVING_PLOT_CONFIG);
  });
});
