/**
 * The store has the following format:
 * {
 *    embeddingType: {
 *      data: {xValues:[1,2], yValues:[5,3], cellIds:[0,3]},
 *      loading: false,
 *      error: false
 *    }
 * }
 */

const initialEmbeddingState = {
  data: {},
  loading: true,
  error: false,
};

const initialState = {};

export { initialEmbeddingState };
export default initialState;
