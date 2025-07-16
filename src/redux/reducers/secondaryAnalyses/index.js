import { HYDRATE } from 'next-redux-wrapper';

import _ from 'lodash';
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
  SECONDARY_ANALYSIS_STATUS_LOADING,
  SECONDARY_ANALYSIS_STATUS_LOADED,
  SECONDARY_ANALYSIS_LOGS_LOADING,
  SECONDARY_ANALYSIS_LOGS_LOADED,
  SECONDARY_PAIR_MATCHES_UPDATED,
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

import secondaryAnalysisStatusLoading from './secondaryAnalysisStatusLoading';
import secondaryAnalysisStatusLoaded from './secondaryAnalysisStatusLoaded';

import secondaryAnalysisLogsLoaded from './secondaryAnalysisLogsLoaded';
import secondaryAnalysisLogsLoading from './secondaryAnalysisLogsLoading';

import pairMatchesUpdated from './pairMatchesUpdated';

const notificationsReducer = (state = initialState, action = {}) => {
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

    case SECONDARY_ANALYSIS_STATUS_LOADING: {
      return secondaryAnalysisStatusLoading(state, action);
    }

    case SECONDARY_ANALYSIS_STATUS_LOADED: {
      return secondaryAnalysisStatusLoaded(state, action);
    }

    case SECONDARY_ANALYSIS_LOGS_LOADING: {
      return secondaryAnalysisLogsLoading(state, action);
    }

    case SECONDARY_ANALYSIS_LOGS_LOADED: {
      return secondaryAnalysisLogsLoaded(state, action);
    }

    case SECONDARY_PAIR_MATCHES_UPDATED: {
      return pairMatchesUpdated(state, action);
    }

    case HYDRATE: {
      const { secondaryAnalyses } = action.payload;

      const { activeSecondaryAnalysisId } = secondaryAnalyses.meta;

      if (activeSecondaryAnalysisId) {
        const newState = _.cloneDeep(state);

        newState.meta.activeSecondaryAnalysisId = activeSecondaryAnalysisId;
        newState[activeSecondaryAnalysisId] = secondaryAnalyses[activeSecondaryAnalysisId];

        return newState;
      }

      return state;
    }

    default: {
      return state;
    }
  }
};

export default notificationsReducer;
