import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const getAnalysisTool = () => (state) => {
  const analysisTool = state?.processing?.dataIntegration?.analysisTool;

  if (_.isNil(analysisTool)) {
    return null;
  }

  return analysisTool;
};

export default createMemoizedSelector(getAnalysisTool);
