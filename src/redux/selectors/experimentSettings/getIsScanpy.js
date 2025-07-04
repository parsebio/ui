import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import getAnalysisTool from 'redux/selectors/experimentSettings/getAnalysisTool';
import { analysisTools } from 'const';

const getIsScanpy = () => (analysisTool) => {
  if (_.isNil(analysisTool)) return null;

  return _.isEqual(analysisTool, analysisTools.SCANPY);
};

export default createMemoizedSelector(
  getIsScanpy,
  { inputSelectors: getAnalysisTool() },
);
