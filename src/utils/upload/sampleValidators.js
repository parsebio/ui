import SampleTech from 'const/enums/SampleTech';

import validate10x from 'utils/upload/validate10x';
import validateRhapsody from 'utils/upload/validateRhapsody';
import validateSeurat from 'utils/upload/validateSeurat';
import validateH5 from 'utils/upload/validateH5';
import validateParse from 'utils/upload/validateParse';

const sampleValidators = {
  [SampleTech['10X']]: validate10x,
  [SampleTech.RHAPSODY]: validateRhapsody,
  [SampleTech.SEURAT]: validateSeurat,
  [SampleTech.H5]: validateH5,
  [SampleTech.PARSE]: validateParse,
};

export default sampleValidators;
