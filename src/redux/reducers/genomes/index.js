import {
  GENOME_FILE_UPDATE, GENOMES_UPDATED,
  GENOMES_LOADED, GENOMES_ERROR, GENOMES_CREATED,
  GENOME_FILE_DELETED, GENOME_FILE_CREATED,
} from 'redux/actionTypes/genomes';
import initialState from 'redux/reducers/genomes/initialState';
import genomeFileUpdated from 'redux/reducers/genomes/genomeFileUpdated';
import genomesLoaded from 'redux/reducers/genomes/genomesLoaded';
import genomesError from 'redux/reducers/genomes/genomesError';
import genomesUpdated from 'redux/reducers/genomes/genomesUpdated';
import genomeCreated from 'redux/reducers/genomes/genomeCreated';
import genomeFilesDeleted from 'redux/reducers/genomes/genomeFilesDeleted';

const genomesReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case GENOME_FILE_UPDATE:
    case GENOME_FILE_CREATED: {
      return genomeFileUpdated(state, action);
    }
    case GENOME_FILE_DELETED: {
      return genomeFilesDeleted(state, action);
    }
    case GENOMES_LOADED: {
      return genomesLoaded(state, action);
    }
    case GENOMES_ERROR: {
      return genomesError(state, action);
    }
    case GENOMES_UPDATED: {
      return genomesUpdated(state, action);
    }
    case GENOMES_CREATED: {
      return genomeCreated(state, action);
    }
    default:
      return state;
  }
};

export default genomesReducer;
