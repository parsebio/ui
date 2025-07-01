/* eslint-disable no-param-reassign */
import produce from 'immer';

const plotDataCleared = produce((draft, action) => {
  const { plotUuids } = action.payload;
  plotUuids.forEach((plotUuid) => {
    draft[plotUuid] = {
      ...draft[plotUuid],
      plotData: [],
      loading: false,
      error: false,
    };
  });
});

export default plotDataCleared;
