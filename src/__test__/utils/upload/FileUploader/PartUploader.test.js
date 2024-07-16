import PartUploader from 'utils/upload/FileUploader/PartUploader';

const mockAbortController = jest.fn();

const mockProjectId = 'mock-project-id';
const mockUploadId = 'mock-upload-id';
const mockBucket = 'mock-bucket';
const mockKey = 'mock-key';

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

describe('PartUploader', () => {
  describe('constructor', () => {
    it('works', () => {
      const {
        uploadParams, abortController, fileSize, uploadedParts,
      } = getConstructorParams();

      // eslint-disable-next-line no-new
      new PartUploader(uploadParams, abortController, fileSize, uploadedParts);
    });
  });

  describe('uploadChunk', () => {

  });
});
