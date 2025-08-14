import waitForWorkRequest from 'utils/work/waitForWorkRequest';
import WorkTimeoutError from 'utils/errors/http/WorkTimeoutError';
import WorkResponseError from 'utils/errors/http/WorkResponseError';

jest.mock('utils/socketConnection', () => ({
  __esModule: true,
  default: () => Promise.resolve(mockIO),
}));

const mockIO = {
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('utils/work/unpackResult', () => ({
  decompressUint8Array: jest.fn(async (arr) => arr),
}));
jest.mock('utils/work/parseResult', () => jest.fn((data) => data));
jest.mock('redux/actions/backendStatus', () => ({ updateBackendStatus: jest.fn() }));
jest.mock('const/enums/WorkerStatusCode', () => ({ getDisplayText: jest.fn(() => 'User message') }));

describe('waitForWorkRequest', () => {
  const ETag = 'etag';
  const experimentId = 'exp1';
  const request = 'GetEmbedding';
  const timeout = 1;
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIO.on.mockReset();
    mockIO.off.mockReset();
  });

  it('resolves with data when worker returns result', async () => {
    mockIO.on.mockImplementation((event, cb) => {
      if (event.startsWith('WorkResponse-')) {
        cb(Buffer.from([1, 2, 3]).toString('base64'));
      }
    });
    const result = await waitForWorkRequest(ETag, experimentId, request, timeout, dispatch);
    expect(result.data).toBeDefined();
  });

  it('resolves with signedUrl when worker returns object', async () => {
    mockIO.on.mockImplementation((event, cb) => {
      if (event.startsWith('WorkResponse-')) {
        cb({ response: { signedUrl: 'http://example.com' } });
      }
    });
    const result = await waitForWorkRequest(ETag, experimentId, request, timeout, dispatch);
    expect(result.signedUrl).toBe('http://example.com');
  });

  it('rejects with WorkResponseError when worker returns error', async () => {
    mockIO.on.mockImplementation((event, cb) => {
      if (event.startsWith('WorkResponse-')) {
        cb({ response: { error: true, userMessage: 'Worker failed' } });
      }
      if (event.startsWith('Heartbeat-')) {
        // do nothing
      }
    });
    await expect(
      waitForWorkRequest(ETag, experimentId, request, timeout, dispatch),
    ).rejects.toThrow(WorkResponseError);
  });
});
