import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import getAnalysisTool from 'redux/selectors/experimentSettings/getAnalysisTool';
import { analysisTools } from 'utils/constants';

const isScanpy = () => (analysisTool) => (
  _.isEqual(analysisTool, analysisTools.SCANPY)
);

export default createMemoizedSelector(
  isScanpy,
  { inputSelectors: getAnalysisTool },
);
