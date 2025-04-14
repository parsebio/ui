import { updateExperimentInfo } from 'redux/actions/experimentSettings';

const setMockedExperimentInfo = async (experimentId, store) => {
  await store.dispatch(
    updateExperimentInfo({
      experimentId,
      experimentName: 'mockedName',
      sampleIds: ['1', '2'],
      pipelineVersion: 'v2',
      accessRole: 'owner',
    }),
  );
};

export default setMockedExperimentInfo;
