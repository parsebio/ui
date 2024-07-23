import axios from 'axios';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import { setupNavigatorLocks } from '__test__/test-utils/mockLocks';

import PartUploader from 'utils/upload/FileUploader/PartUploader';

const mockAbortController = { signal: 'mockSignal' };

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

      // passes the mockAbortController.signal to the axios request
      expect(axios.request.mock.calls[0][0].signal).toEqual(mockAbortController.signal);
    });

    it('Uploads single part for 2 under 5mb parts', async () => {
      const chunk1 = getChunk(4 * MB);
      const chunk2 = getChunk(4 * MB);

      await partUploader.uploadChunk(chunk1, mockOnUploadProgress);

      // Didn't upload yet because we didn't reach the minimum 5mb
      expect(axios.request).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();

      await partUploader.uploadChunk(chunk2, mockOnUploadProgress);

      // Upload because we are over 5mb accumulated size
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledTimes(1);

      fetchMock.mockClear();
      axios.request.mockClear();

      await partUploader.finishUpload();
      // Nothing else to upload
      expect(axios.request).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('uploads 2 parts over 5 mb each', async () => {
      const chunk1 = getChunk(6 * MB);
      const chunk2 = getChunk(6 * MB);

      await partUploader.uploadChunk(chunk1, mockOnUploadProgress);

      // Upload because we reached the minimum 5mb
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledTimes(1);

      fetchMock.mockClear();
      axios.request.mockClear();

      await partUploader.uploadChunk(chunk2, mockOnUploadProgress);
      // Upload because we reached the minimum 5mb
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(axios.request).toHaveBeenCalledTimes(1);

      fetchMock.mockClear();
      axios.request.mockClear();

      await partUploader.finishUpload();

      // Nothing else to upload
      expect(axios.request).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
