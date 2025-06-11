import _ from 'lodash';
import dayjs from 'dayjs';

import SampleTech, { getSampleTechMetadataValue } from 'const/enums/SampleTech';

import {
  SAMPLES_CREATED, SAMPLES_ERROR, SAMPLES_SAVED, SAMPLES_SAVING,
} from 'redux/actionTypes/samples';

import fetchAPI from 'utils/http/fetchAPI';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

import { METADATA_DEFAULT_VALUE } from 'redux/reducers/experiments/initialState';
import { defaultSampleOptions, sampleTemplate } from 'redux/reducers/samples/initialState';
import UploadStatus from 'utils/upload/UploadStatus';
import { createMetadataTrack, updateValuesInMetadataTrack } from '../experiments';

// If the sample name of new samples coincides with already existing
// ones we should not create new samples,
// just reuse their sampleIds and upload the new files
const splitByAlreadyExistingSamples = (
  newSamples,
  sampleIds,
  samples,
  sampleTechnology,
  options,
  kit,
) => {
  const alreadyCreatedSampleIds = {};

  sampleIds.forEach((sampleId) => {
    const [
      repeatedSampleName = null,
    ] = newSamples.find(([name]) => name === samples[sampleId].name) ?? [];

    if (!repeatedSampleName) return;

    alreadyCreatedSampleIds[repeatedSampleName] = sampleId;
  });

  const samplesToCreate = newSamples
    // Upload only the samples that don't have a repeated name
    .filter(([name]) => !alreadyCreatedSampleIds[name])
    .map(([name]) => ({
      name,
      sampleTechnology,
      options,
      kit,
    }));

  return { samplesToCreate, alreadyCreatedSampleIds };
};

const getSamplesByTechnology = (samples) => (
  samples
    .reduce(
      (acc, sample) => {
        acc[sample.type] = acc[sample.type] ?? [];
        acc[sample.type].push(sample);
        return acc;
      },
      {},
    )
);

const createSamples = (
  experimentId,
  newSamples,
  sampleTechnology,
) => async (dispatch, getState) => {
  dispatch({
    type: SAMPLES_SAVING,
    payload: {
      message: endUserMessages.SAVING_SAMPLE,
    },
  });

  const experiment = getState().experiments[experimentId];
  const { samples } = getState();

  const createdDate = dayjs().toISOString();

  if (!Object.values(SampleTech).includes(sampleTechnology)) throw new Error(`Sample technology ${sampleTechnology} is not recognized`);

  let options = defaultSampleOptions[sampleTechnology] || {};
  let kit = null;

  const oldSamples = experiment.sampleIds.map((sampleId) => samples[sampleId]);

  const oldSamplesByTechnology = getSamplesByTechnology(oldSamples);

  // If there are other parse samples in the same experiment, use the options and kit
  // values from the other ones (since we don't allow multi kits exps yet)
  if (
    sampleTechnology === 'parse'
    && oldSamplesByTechnology.parse?.length > 0
  ) {
    const firstSample = oldSamplesByTechnology.parse[0];
    options = firstSample.options;
    kit = firstSample.kit;
  }

  const {
    samplesToCreate, alreadyCreatedSampleIds,
  } = splitByAlreadyExistingSamples(
    newSamples,
    experiment.sampleIds,
    samples,
    sampleTechnology,
    options,
    kit,
  );

  if (samplesToCreate.length === 0) {
    dispatch({ type: SAMPLES_SAVED });

    return alreadyCreatedSampleIds;
  }

  const url = `/v2/experiments/${experimentId}/samples`;

  try {
    const newSampleIdsByName = await fetchAPI(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(samplesToCreate),
      },
    );

    // Join the already existing sampleIds with the new ones,
    // order is preserved in newSamples
    const sampleIdsByName = { ...alreadyCreatedSampleIds, ...newSampleIdsByName };

    const newSamplesToRedux = newSamples
      // Remove repeated samples
      .filter(([name]) => newSampleIdsByName[name])
      .map(([name, { files }]) => ({
        ..._.cloneDeep(sampleTemplate),
        name,
        type: sampleTechnology,
        experimentId,
        uuid: sampleIdsByName[name],
        createdDate,
        lastModified: createdDate,
        options,
        metadata: experiment?.metadataKeys.reduce((acc, metadataKey) => (
          { ...acc, [metadataKey]: METADATA_DEFAULT_VALUE }), {}) ?? {},

        files: Object.keys(files).reduce(((acc, fileType) => (
          { ...acc, [fileType]: { upload: { status: UploadStatus.UPLOADING } } }
        )), {}),
      }));

    dispatch({
      type: SAMPLES_CREATED,
      payload: {
        experimentId,
        samples: newSamplesToRedux,
      },
    });

    const newSamplesToUpdateByTechnology = getSamplesByTechnology(newSamplesToRedux);

    const allSamples = _.mergeWith(
      {},
      newSamplesToUpdateByTechnology,
      oldSamplesByTechnology,
      (objValue, srcValue) => {
        if (_.isArray(objValue) && _.isArray(srcValue)) {
          return objValue.concat(srcValue);
        }
      },
    );

    let technologyMetadataTrackExists = Boolean(
      _.sample(
        Object.values(oldSamplesByTechnology)[0] ?? [],
      )?.metadata?.Technology,
    );

    let samplesToUpdateByTechnology = newSamplesToUpdateByTechnology;

    // If multitech, then add the Technology metadata track
    if (Object.keys(allSamples).length > 1 && !technologyMetadataTrackExists) {
      // If the Technology metadata track does not already exist, create it
      await dispatch(createMetadataTrack('Technology', experimentId));

      samplesToUpdateByTechnology = allSamples;
      technologyMetadataTrackExists = true;
    }

    if (technologyMetadataTrackExists) {
      const updates = Object.entries(samplesToUpdateByTechnology)
        .map(([technology, currSamples]) => ({
          value: getSampleTechMetadataValue(technology),
          sampleIds: currSamples.map((sample) => sample.uuid),
        }));

      await dispatch(updateValuesInMetadataTrack(experimentId, 'Technology', updates));
    }

    dispatch({ type: SAMPLES_SAVED });

    return sampleIdsByName;
  } catch (e) {
    console.error(e);
    const errorMessage = handleError(e, endUserMessages.ERROR_CREATING_SAMPLE);

    dispatch({
      type: SAMPLES_ERROR,
      payload: {
        error: errorMessage,
      },
    });

    // throw again the error so `processSampleUpload` won't upload the sample
    throw new Error(errorMessage);
  }
};

export default createSamples;
