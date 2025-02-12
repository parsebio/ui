import _ from 'lodash';

import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

import addLazySets from 'utils/addLazySets';
import initialState from '../../reducers/cellSets/initialState';

const getCellSets = () => (state) => {
  const stateToReturn = (state && Object.keys(state).length ? state : initialState);

  const accessible = !stateToReturn.loading
    && !stateToReturn.initialLoadPending
    && !stateToReturn.updatingClustering
    && !stateToReturn.error;

  const { properties } = stateToReturn;
  const propertiesWithExtraKeys = {};

  if (!_.isEmpty(properties)) {
    addLazySets(properties, propertiesWithExtraKeys);
  }

  return {
    ...stateToReturn,
    properties: propertiesWithExtraKeys,
    accessible,
  };
};

export default createMemoizedSelector(getCellSets);
