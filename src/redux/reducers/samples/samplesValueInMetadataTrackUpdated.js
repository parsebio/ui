/* eslint-disable no-param-reassign */
import produce from 'immer';

const samplesValueInMetadataTrackUpdated = produce((draft, action) => {
  const { sampleUuids, key, value } = action.payload;

  sampleUuids.forEach((sampleUuid) => {
    draft[sampleUuid].metadata[key] = value;
  });
  draft.meta.saving = false;
  draft.meta.error = false;
});

export default samplesValueInMetadataTrackUpdated;
