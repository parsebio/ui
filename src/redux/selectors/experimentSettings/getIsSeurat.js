import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import getAnalysisTool from 'redux/selectors/experimentSettings/getAnalysisTool';
import { analysisTools } from 'utils/constants';

const getIsSeurat = () => (analysisTool) => {
  if (_.isNil(analysisTool)) return null;

  return _.isEqual(analysisTool, analysisTools.SEURAT);
};

export default createMemoizedSelector(
  getIsSeurat,
  { inputSelectors: getAnalysisTool() },
);
