/* eslint-disable no-param-reassign */
import produce from 'immer';

const samplesValueInMetadataTrackUpdated = produce((draft, action) => {
  const { key, updates } = action.payload;

  updates.forEach(({ sampleIds, value }) => {
    sampleIds.forEach((sampleId) => {
      draft[sampleId].metadata[key] = value;
    });
  });

  draft.meta.saving = false;
  draft.meta.error = false;
});

export default samplesValueInMetadataTrackUpdated;
