import PartUploader from 'utils/upload/FileUploader/PartUploader';

const mockAbortController = jest.fn();

const getConstructorParams = () => ({
  uploadParams: [],
  abortController: mockAbortController,
  fileSize: null,
  uploadedParts: null,
});

describe('PartUploader', () => {
  describe('constructor', () => {
    it('works', () => {
      const partUploader = new PartUploader(...getConstructorParams());
    });
  });

  describe('uploadChunk', () => {

  });
});
