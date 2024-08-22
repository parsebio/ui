/* eslint-disable no-param-reassign */
import produce from 'immer';

const samplesBulkKitUpdate = produce((draft, action) => {
  const { sampleUuids, kit } = action.payload;

  sampleUuids.forEach((id) => {
    draft[id].kit = kit;
  });
});

export default samplesBulkKitUpdate;
