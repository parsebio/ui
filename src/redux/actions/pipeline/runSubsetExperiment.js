// import fetchAPI from 'utils/http/fetchAPI';
// import handleError from 'utils/http/handleError';
// import endUserMessages from 'utils/endUserMessages';

const runSubsetExperiment = () => async () => {
  // const runSubsetExperiment = (experimentId, newExperimentName, cellSetKeys) => async () => {
  // eslint-disable-next-line no-alert
  alert('We are performing changes on this feature that require us to disable it for a few minutes. We apologize for the inconvenience.');

  // try {
  //   const newExperimentId = await fetchAPI(
  //     `/v2/experiments/${experimentId}/subset`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         name: newExperimentName,
  //         cellSetKeys,
  //       }),
  //     },
  //   );

  //   return newExperimentId;
  // } catch (e) {
  //   handleError(e, endUserMessages.ERROR_STARTING_PIPLELINE);
  // }
};

export default runSubsetExperiment;
