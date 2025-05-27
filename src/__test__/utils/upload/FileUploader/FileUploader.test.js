import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import { setupNavigatorLocks } from '__test__/test-utils/mockLocks';

import FileUploader from 'utils/upload/FileUploader/FileUploader';

import { waitFor } from '@testing-library/react';

let abortCallback;
const mockAbortController = {
  signal: {
    addEventListener: jest.fn((event, callback) => {
      if (event === 'abort') abortCallback = callback;
    }),
  },
};

const mockProjectId = 'mock-project-id';
const mockUploadId = 'mock-upload-id';
const mockBucket = 'mock-bucket';
const mockKey = 'mock-key';

const mockUploadChunk = jest.fn();
const mockFinishUpload = jest.fn();

const mockAsyncGzip = {
  push: jest.fn(),
  terminate: jest.fn(),
};

const mockFileReaderCallbacks = {};

const mockFileReaderStream = {
  on: jest.fn((event, callback) => {
    mockFileReaderCallbacks[event] = callback;
  }),
  destroy: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
};

const mockPartUploader = {
  uploadChunk: jest.fn(),
  finishUpload: jest.fn(),
};

jest.mock('axios', () => ({ request: jest.fn() }));
jest.mock('fflate', () => ({ AsyncGzip: jest.fn(() => mockAsyncGzip) }));
jest.mock('filereader-stream', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockFileReaderStream),
}));

jest.mock('utils/upload/FileUploader/PartUploader', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockPartUploader),
}));

const MB = 1024 * 1024;

const getChunk = (size) => ({ length: size });

const getDefaultConstructorParams = () => {
  const file = { size: 10 * MB };
  const chunkSize = 5 * MB;
  const uploadParams = {
    projectId: mockProjectId,
    uploadId: mockUploadId,
    bucket: mockBucket,
    key: mockKey,
  };

  const abortController = mockAbortController;
  const onStatusUpdate = jest.fn();
  const options = {
    compress: false,
    resumeUpload: false,
    retryPolicy: 'normal',
  };

  return {
    file,
    chunkSize,
    uploadParams,
    abortController,
    onStatusUpdate,
    options,
  };
};

enableFetchMocks();

describe('FileUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    const {
      file, chunkSize, uploadParams, abortController, onStatusUpdate, options,
    } = getDefaultConstructorParams();

    it('works', () => {
      // eslint-disable-next-line no-new
      new FileUploader(
        file,
        chunkSize,
        uploadParams,
        abortController,
        onStatusUpdate,
        options,
      );
    });

    it('has some input validation', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new FileUploader(
          file,
          chunkSize,
          null,
          abortController,
          onStatusUpdate,
          options,
        );
      }).toThrow('FileUploader: Missing required parameters');
    });

    it('throws if resumeUpload and compress are both true', () => {
      const badOptions = { ...options, resumeUpload: true, compress: true };

      expect(() => {
        // eslint-disable-next-line no-new
        new FileUploader(
          file,
          chunkSize,
          uploadParams,
          abortController,
          onStatusUpdate,
          badOptions,
        );
      }).toThrow('Resumable and compressing uploads at the same time is not implemented yet');
    });
  });

  describe('Upload', () => {
    beforeEach(() => {
      setupNavigatorLocks();

      const mockAPIResponses = generateDefaultMockAPIResponses(mockProjectId);

      fetchMock.resetMocks();
      fetchMock.mockIf(/.*/, mockAPI(mockAPIResponses));
    });

    it('works', async () => {
      const {
        file, chunkSize, uploadParams, abortController, onStatusUpdate, options,
      } = getDefaultConstructorParams();

      const fileUploader = new FileUploader(
        file,
        chunkSize,
        uploadParams,
        abortController,
        onStatusUpdate,
        options,
      );

      mockUploadChunk.mockResolvedValueOnce();
      mockFinishUpload.mockResolvedValueOnce();

      const resPromise = fileUploader.upload();

      await waitFor(() => {
        expect(mockFileReaderCallbacks.data).toBeDefined();
      });

      mockFileReaderCallbacks.data(getChunk(5 * MB));

      await waitFor(() => {
        expect(mockPartUploader.uploadChunk).toHaveBeenCalledTimes(1);
      });
      expect(mockPartUploader.finishUpload).not.toHaveBeenCalled();

      mockFileReaderCallbacks.data(getChunk(5 * MB));

      await waitFor(() => {
        expect(mockPartUploader.uploadChunk).toHaveBeenCalledTimes(2);
        expect(mockPartUploader.finishUpload).toHaveBeenCalledTimes(1);
      });

      await resPromise;
    });

    it('works with compression', async () => {
      const {
        file, chunkSize, uploadParams, abortController, onStatusUpdate, options,
      } = getDefaultConstructorParams();

      const fileUploader = new FileUploader(
        file,
        chunkSize,
        uploadParams,
        abortController,
        onStatusUpdate,
        { ...options, compress: true },
      );

      mockUploadChunk.mockResolvedValueOnce();
      mockFinishUpload.mockResolvedValueOnce();

      const resPromise = fileUploader.upload();

      await waitFor(() => {
        expect(mockFileReaderCallbacks.data).toBeDefined();
        expect(mockAsyncGzip.ondata).toBeDefined();
      });

      mockFileReaderCallbacks.data(getChunk(5 * MB));

      // Compress calls are shifted by one to deal with the difference in stream handling
      // So no call yet
      expect(mockAsyncGzip.push).not.toHaveBeenCalled();

      mockFileReaderCallbacks.data(getChunk(5 * MB));

      // Now push because we have the previous chunk in the buffer
      await waitFor(() => {
        expect(mockAsyncGzip.push).toHaveBeenCalledTimes(1);
      });

      // Return the compressed chunk
      mockAsyncGzip.ondata(null, getChunk(4 * MB));

      await waitFor(() => {
        expect(mockPartUploader.uploadChunk).toHaveBeenCalledTimes(1);
      });
      expect(mockPartUploader.finishUpload).not.toHaveBeenCalled();

      // Reader finish reading so now the last part gets pushed over to gzip
      mockFileReaderCallbacks.end();

      await waitFor(() => {
        expect(mockAsyncGzip.push).toHaveBeenCalledTimes(2);
      });

      mockAsyncGzip.ondata(null, getChunk(4 * MB));

      await waitFor(() => {
        expect(mockPartUploader.uploadChunk).toHaveBeenCalledTimes(2);
        expect(mockPartUploader.finishUpload).toHaveBeenCalledTimes(1);
      });

      await resPromise;
    });

    it('handles the abort signal', async () => {
      const {
        file, chunkSize, uploadParams, abortController, onStatusUpdate, options,
      } = getDefaultConstructorParams();

      const fileUploader = new FileUploader(
        file,
        chunkSize,
        uploadParams,
        abortController,
        onStatusUpdate,
        { ...options, compress: true },
      );

      mockUploadChunk.mockResolvedValueOnce();
      mockFinishUpload.mockResolvedValueOnce();

      const resPromise = fileUploader.upload();

      await waitFor(() => {
        expect(mockFileReaderCallbacks.data).toBeDefined();
      });

      mockFileReaderCallbacks.data(getChunk(5 * MB));
      mockAsyncGzip.ondata(null, getChunk(4 * MB));

      await waitFor(() => {
        expect(mockPartUploader.uploadChunk).toHaveBeenCalledTimes(1);
      });
      expect(mockPartUploader.finishUpload).not.toHaveBeenCalled();

      abortCallback({ target: { reason: 'random reason' } });

      expect(mockFileReaderStream.destroy).toHaveBeenCalledTimes(1);
      expect(mockAsyncGzip.terminate).toHaveBeenCalledTimes(1);

      await expect(async () => await resPromise).rejects.toThrow('random reason');
    });
  });
});
