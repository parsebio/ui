import { updateExperimentInfo } from 'redux/actions/experimentSettings';

const getMockedInfoState = (experimentId, accessRole = 'owner') => ({
  experimentId,
  experimentName: 'mockedName',
  sampleIds: ['1', '2'],
  pipelineVersion: 'v2',
  accessRole,
});

const setMockedExperimentInfo = async (experimentId, store, accessRole = 'owner') => {
  await store.dispatch(updateExperimentInfo(getMockedInfoState(experimentId, accessRole)));
};

export default setMockedExperimentInfo;

export { getMockedInfoState };
