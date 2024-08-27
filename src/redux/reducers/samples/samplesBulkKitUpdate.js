/* eslint-disable no-param-reassign */
import produce from 'immer';

const samplesBulkKitUpdate = produce((draft, action) => {
  const { sampleIds, kit } = action.payload;

  sampleIds.forEach((id) => {
    draft[id].kit = kit;
  });
});

export default samplesBulkKitUpdate;
