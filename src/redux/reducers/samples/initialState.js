import SampleTech from 'const/enums/SampleTech';

const sampleTemplate = {
  name: null,
  experimentId: null,
  uuid: null,
  type: null,
  createdDate: null,
  lastModified: null,
  complete: false,
  error: false,
  files: {},
  metadata: {},
  options: {},
  kit: null,
};

// TODO: Update, this initial state doesn't even match the previously used structure
const sampleFileTemplate = {
  objectKey: '',
  size: 0,
  success: false,
  error: false,
  upload: {
    status: null,
  },
};

const defaultSampleOptions = {
  [SampleTech.RHAPSODY]: {
    includeAbSeq: false,
  },
};

const initialState = {
  meta: {
    loading: false,
    error: false,
    saving: false,
    validating: [],
  },
};

export default initialState;
export {
  sampleTemplate,
  sampleFileTemplate,
  defaultSampleOptions,
};
