import initialState from './initialState';
import {
  SECONDARY_ANALYSES_CREATED,
  SECONDARY_ANALYSES_ERROR,
  SECONDARY_ANALYSES_LOADED,
  SECONDARY_ANALYSES_LOADING,
  SECONDARY_ANALYSES_SAVING,
  SECONDARY_ANALYSES_SET_ACTIVE,
} from '../../actionTypes/secondaryAnalyses';

import secondaryAnalysesLoading from './secondaryAnalysesLoading';
import secondaryAnalysesLoaded from './secondaryAnalysesLoaded';
import secondaryAnalysesSaving from './secondaryAnalysesSaving';
import secondaryAnalysesError from './secondaryAnalysesError';
import secondaryAnalysisCreated from './secondaryAnalysisCreated';
import secondaryAnalysisSetActive from './secondaryAnalysisSetActive';

const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SECONDARY_ANALYSES_LOADING: {
      return secondaryAnalysesLoading(state, action);
    }

    case SECONDARY_ANALYSES_LOADED: {
      return secondaryAnalysesLoaded(state, action);
    }

    case SECONDARY_ANALYSES_CREATED: {
      return secondaryAnalysisCreated(state, action);
    }

    case SECONDARY_ANALYSES_SAVING: {
      return secondaryAnalysesSaving(state, action);
    }

    case SECONDARY_ANALYSES_ERROR: {
      return secondaryAnalysesError(state, action);
    }
    case SECONDARY_ANALYSES_SET_ACTIVE: {
      return secondaryAnalysisSetActive(state, action);
    }
    default: {
      return state;
    }
  }
};

export default notificationsReducer;
