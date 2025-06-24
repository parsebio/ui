/* eslint-disable no-param-reassign */
import produce from 'immer';
import initialState, { initialEmbeddingState } from './initialState';

const embeddingsLoaded = produce((draft, action) => {
  const { embeddingType, data: jsonData } = action.payload;

  draft[embeddingType] = {
    ...initialEmbeddingState,
    loading: false,
  };

  draft[embeddingType].data = jsonData;
}, initialState);

export default embeddingsLoaded;
