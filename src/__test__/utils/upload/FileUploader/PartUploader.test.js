import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import { setupNavigatorLocks } from '__test__/test-utils/mockLocks';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import putInS3 from 'utils/upload/putInS3';

import PartUploader from 'utils/upload/FileUploader/PartUploader';

const mockAbortController = jest.fn();

const mockProjectId = 'mock-project-id';
const mockUploadId = 'mock-upload-id';
const mockBucket = 'mock-bucket';
const mockKey = 'mock-key';

jest.mock('utils/upload/putInS3');

const MB = 1024 * 1024;
const getChunk = (size) => ({ length: size });

const getConstructorParams = () => ({
  uploadParams: {
    projectId: mockProjectId,
    uploadId: mockUploadId,
    bucket: mockBucket,
    key: mockKey,
  },
  abortController: mockAbortController,
  fileSize: 100,
  uploadedParts: [],
});

enableFetchMocks();

describe('PartUploader', () => {
  let putInS3PartNumber = 1;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockAPIResponses = generateDefaultMockAPIResponses(mockProjectId);

    setupNavigatorLocks();

    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, (req) => {
      console.log('reqUrlDebug');
      console.log(req.url);
      return mockAPI(mockAPIResponses)(req);
    });

    putInS3.mockImplementation(() => {
      const response = { headers: { etag: `mock-etag-${putInS3PartNumber}` } };
      putInS3PartNumber += 1;

      return Promise.resolve(response);
    });
  });

  describe('constructor', () => {
    it('works', () => {
      const {
        uploadParams, abortController, fileSize, uploadedParts,
      } = getConstructorParams();

      // eslint-disable-next-line no-new
      new PartUploader(uploadParams, abortController, fileSize, uploadedParts);
    });
  });

  describe('upload', () => {
    let partUploader;

    const mockOnUploadProgress = jest.fn();

    beforeEach(() => {
      const {
        uploadParams, abortController, fileSize, uploadedParts,
      } = getConstructorParams();

      partUploader = new PartUploader(uploadParams, abortController, fileSize, uploadedParts);
    });

    it('uploads single part under 5mb', async () => {
      const chunk = getChunk(4 * MB);

      await partUploader.uploadChunk(chunk, mockOnUploadProgress);

      await partUploader.finishUpload();
    });
  });
});
