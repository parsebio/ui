/* eslint-disable no-param-reassign */
import { combineReducers } from 'redux';
import cellInfoReducer from './cellInfo';
import cellMetaReducer from './cellMeta';
import cellSetsReducer from './cellSets';
import componentConfigReducer from './componentConfig/index';
import differentialExpressionReducer from './differentialExpression';
import embeddingsReducer from './embeddings';
import experimentsReducer from './experiments';
import experimentSettingsReducer from './experimentSettings';
import genesReducer from './genes';
import layoutReducer from './layout';
import sampleReducer from './samples';
import backendStatusReducer from './backendStatus';
import networkResourcesReducer from './networkResources';
import userReducer from './user';
import secondaryAnalysesReducer from './secondaryAnalyses';
import genomesReducer from './genomes';
import { EXPERIMENTS_SWITCH } from '../actionTypes/experiments';

const appReducers = combineReducers({
  cellInfo: cellInfoReducer,
  cellMeta: cellMetaReducer,
  cellSets: cellSetsReducer,
  componentConfig: componentConfigReducer,
  differentialExpression: differentialExpressionReducer,
  embeddings: embeddingsReducer,
  experiments: experimentsReducer,
  experimentSettings: experimentSettingsReducer,
  secondaryAnalyses: secondaryAnalysesReducer,
  backendStatus: backendStatusReducer,
  genes: genesReducer,
  genomes: genomesReducer,
  layout: layoutReducer,
  samples: sampleReducer,
  networkResources: networkResourcesReducer,
  user: userReducer,
});

const rootReducer = (state, action) => {
  let newState = state;
  if (action.type === EXPERIMENTS_SWITCH) {
    // we need to keep the old state for these parts of the store
    newState = {
      samples: state.samples,
      backendStatus: state.backendStatus,
      experiments: state.experiments,
      networkResources: state.networkResources,
      user: state.user,
    };
  }

  return appReducers(newState, action);
};

export default rootReducer;
