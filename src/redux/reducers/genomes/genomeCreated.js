/* eslint-disable no-param-reassign */
import produce from 'immer';

const genomeCreated = produce((draft, action) => {
  const { id, name, description } = action.payload;

  draft.custom[id] = {
    id,
    name,
    description,
    files: {},
    createdAt: new Date().toISOString(),
  };
});

export default genomeCreated;
