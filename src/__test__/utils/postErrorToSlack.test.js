import postErrorToSlack from 'utils/postErrorToSlack';
import fetchAPI from 'utils/http/fetchAPI';

jest.mock('utils/http/fetchAPI');

const mockError = { message: 'mockMessage', stack: 'Mock error stack' };
const mockReduxDump = {
  cellInfo: {
    focus: {
      store: 'cellSets',
      key: 'louvain',
    },
    groupedTrack: 'louvain',
    selectedTracks: [
      'louvain',
    ],
  },
  cellSets: {
    properies: {
      'louvain-0': {
        cellIds: new Set(Array(25).fill(0)),
      },
    },
  },
  cellMeta: {
    mitochondrialContent: {
      loading: true,
      error: false,
      data: new Array(25).fill(0),
    },
  },
  networkResources: {
    environment: 'test',
  },
};

jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());

delete window.location;
window.location = {
  href: 'http://localhost:3000/experiments/testae48e318dab9a1bd0bexperiment/data-exploration',
};

jest.mock('@aws-amplify/auth', () => ({
  Auth: {
    currentAuthenticatedUser: () => Promise.resolve({
      attributes: {
        name: 'John Doe',
        email: 'fake@email.com',
      },
      username: '5152fake-eb52-474c-user-mocke8c8user',
    }),
  },
}));

jest.mock('stacktrace-js', () => ({
  fromError: () => Promise.resolve(['line1', 'line2']),
}));

describe('PostErrorToSlack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Posts requests correctly', async () => {
    await postErrorToSlack(mockError, mockReduxDump);

    expect(fetchAPI).toHaveBeenCalledTimes(1);
    expect(fetchAPI.mock.calls[0]).toMatchSnapshot();

    const { body: formData } = fetchAPI.mock.calls[0][1];
    expect(formData).toMatchSnapshot();
  });

  it('Should not throw an error if POSTing fails', async () => {
    fetchAPI.mockImplementation(() => Promise.reject(new Error('Failed')));

    await postErrorToSlack(mockError, mockReduxDump);

    expect(fetchAPI).toHaveBeenCalledTimes(1);
  });
});
