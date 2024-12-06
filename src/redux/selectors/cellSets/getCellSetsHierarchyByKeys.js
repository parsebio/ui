import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import _ from 'lodash';
import getCellSetsHierarchy from './getCellSetsHierarchy';

const getCellSetsHierarchyByKeys = (keys) => (hierarchy) => {
  if (hierarchy.length === 0 || !_.isArray(keys)) return [];

  return (
    keys.map((key) => hierarchy.find((child) => child.key === key))
  );
};

export default createMemoizedSelector(
  getCellSetsHierarchyByKeys,
  { inputSelectors: getCellSetsHierarchy() },
);
