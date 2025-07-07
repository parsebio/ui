import _ from 'lodash';

import { analysisTools } from 'const';
import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import getAnalysisTool from 'redux/selectors/experimentSettings/getAnalysisTool';

const getIsSeurat = () => (analysisTool) => {
  if (_.isNil(analysisTool)) return null;

  return _.isEqual(analysisTool, analysisTools.SEURAT);
};

export default createMemoizedSelector(
  getIsSeurat,
  { inputSelectors: getAnalysisTool() },
);
