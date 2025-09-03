import {
  GENOME_FILE_UPDATE, GENOMES_UPDATED,
  GENOMES_LOADED, GENOMES_ERROR,
} from 'redux/actionTypes/genomes';
import initialState from 'redux/reducers/genomes/initialState';
import genomeFileUpdated from 'redux/reducers/genomes/genomeFileUpdated';
import genomesLoaded from 'redux/reducers/genomes/genomesLoaded';
import genomesError from 'redux/reducers/genomes/genomesError';
import genomesUpdated from 'redux/reducers/genomes/genomesUpdated';

const genomesReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case GENOME_FILE_UPDATE: {
      return genomeFileUpdated(state, action);
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
    default:
      return state;
  }
};

export default genomesReducer;
