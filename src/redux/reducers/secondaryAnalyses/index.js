import initialState from './initialState';
import {
  SECONDARY_ANALYSES_CREATED,
  SECONDARY_ANALYSES_ERROR,
  SECONDARY_ANALYSES_LOADED,
  SECONDARY_ANALYSES_LOADING,
  SECONDARY_ANALYSES_SAVING,
  SECONDARY_ANALYSES_SET_ACTIVE,
  SECONDARY_ANALYSES_DELETED,
  SECONDARY_ANALYSES_UPDATED,
  SECONDARY_ANALYSIS_FILES_LOADING,
  SECONDARY_ANALYSIS_FILES_LOADED,
  SECONDARY_ANALYSIS_FILES_ERROR,
  SECONDARY_ANALYSIS_FILES_UPDATE,
  SECONDARY_ANALYSIS_FILES_DELETE,
} from '../../actionTypes/secondaryAnalyses';

import secondaryAnalysesLoading from './secondaryAnalysesLoading';
import secondaryAnalysesLoaded from './secondaryAnalysesLoaded';
import secondaryAnalysesSaving from './secondaryAnalysesSaving';
import secondaryAnalysesError from './secondaryAnalysesError';
import secondaryAnalysisCreated from './secondaryAnalysisCreated';
import secondaryAnalysisSetActive from './secondaryAnalysisSetActive';
import secondaryAnalysisDeleted from './secondaryAnalysisDeleted';
import secondaryAnalysisUpdated from './secondaryAnalysisUpdated';

import secondaryAnalysisFilesLoaded from './secondaryAnalysisFilesLoaded';
import secondaryAnalysisFileUpdated from './secondaryAnalysisFileUpdated';
import secondaryAnalysisFileDeleted from './secondaryAnalysisFileDeleted';
import secondaryAnalysisFilesLoading from './secondaryAnalysisFilesLoading';
import secondaryAnalysisFileError from './secondaryAnalysisFileError';

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

    case SECONDARY_ANALYSES_DELETED: {
      return secondaryAnalysisDeleted(state, action);
    }
    case SECONDARY_ANALYSES_UPDATED: {
      return secondaryAnalysisUpdated(state, action);
    }

    case SECONDARY_ANALYSIS_FILES_LOADING: {
      return secondaryAnalysisFilesLoading(state, action);
    }
    case SECONDARY_ANALYSIS_FILES_LOADED: {
      return secondaryAnalysisFilesLoaded(state, action);
    }

    case SECONDARY_ANALYSIS_FILES_ERROR: {
      return secondaryAnalysisFileError(state, action);
    }

    case SECONDARY_ANALYSIS_FILES_UPDATE: {
      return secondaryAnalysisFileUpdated(state, action);
    }

    case SECONDARY_ANALYSIS_FILES_DELETE: {
      return secondaryAnalysisFileDeleted(state, action);
    }

    default: {
      return state;
    }
  }
};

export default notificationsReducer;
