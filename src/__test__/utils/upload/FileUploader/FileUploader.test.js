import axios from 'axios';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import { setupNavigatorLocks } from '__test__/test-utils/mockLocks';

import PartUploader from 'utils/upload/FileUploader/PartUploader';
import FileUploader from 'utils/upload/FileUploader/FileUploader';
import { resumeUpload } from 'utils/upload/processSecondaryUpload';

const mockAbortController = {
  signal: {
    addEventListener: jest.fn(),
  },
};

const mockProjectId = 'mock-project-id';
const mockUploadId = 'mock-upload-id';
const mockBucket = 'mock-bucket';
const mockKey = 'mock-key';

jest.mock('axios', () => ({ request: jest.fn() }));

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
    resumeUpload: true,
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
      const badOptions = { ...options, compress: true };

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
});
