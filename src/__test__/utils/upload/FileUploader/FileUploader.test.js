import axios from 'axios';
import { AsyncGzip } from 'fflate';
import filereaderStream from 'filereader-stream';

import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import { setupNavigatorLocks } from '__test__/test-utils/mockLocks';

import FileUploader from 'utils/upload/FileUploader/FileUploader';
import PartUploader from 'utils/upload/FileUploader/PartUploader';
import { resumeUpload } from 'utils/upload/processSecondaryUpload';
import { waitFor } from '@testing-library/react';

const mockAbortController = {
  signal: {
    addEventListener: jest.fn(),
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
  onData: jest.fn(),
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

jest.mock('axios', () => ({ request: jest.fn() }));
jest.mock('fflate', () => ({ AsyncGzip: jest.fn(() => mockAsyncGzip) }));
jest.mock('filereader-stream', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockFileReaderStream),
}));

jest.mock('utils/upload/FileUploader/PartUploader', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    uploadChunk: jest.fn(),
    finishUpload: jest.fn(),
  })),
}));

const MB = 1024 * 1024;

const getDefaultConstructorParams = () => {
  const file = { size: 5 * MB };
  const chunkSize = 10;
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
        file, chunkSize, uploadParams, abortController, onStatusUpdate, options,
      );

      mockUploadChunk.mockResolvedValueOnce();
      mockFinishUpload.mockResolvedValueOnce();

      const resPromise = fileUploader.upload();

      await waitFor(() => {
        expect(mockFileReaderCallbacks.data).toBeDefined();
      });

      // console.log('')
      // mockFileReaderCallbacks.data();
      // await resPromise;
    });
  });
});
