import axios from 'axios';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import { setupNavigatorLocks } from '__test__/test-utils/mockLocks';

import PartUploader from 'utils/upload/FileUploader/PartUploader';

const mockAbortController = jest.fn();

const mockProjectId = 'mock-project-id';
const mockUploadId = 'mock-upload-id';
const mockBucket = 'mock-bucket';
const mockKey = 'mock-key';

jest.mock('axios', () => ({ request: jest.fn() }));

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
  let uploadPartNumberIt = 1;
  beforeEach(() => {
    jest.clearAllMocks();

    const mockAPIResponses = generateDefaultMockAPIResponses(mockProjectId);

    setupNavigatorLocks();

    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockAPIResponses));

    axios.request.mockImplementation(() => {
      uploadPartNumberIt += 1;
      const response = { headers: { etag: `mock-etag-${uploadPartNumberIt}` } };

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

      // Didn't upload yet because we didn't reach the minimum 5mb
      expect(axios.request).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();

      await partUploader.finishUpload();

      // Uploaded even though it didn't reach 5mb because we know it's the last part
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledTimes(1);
    });
  });
});
