import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { DndProvider } from 'react-dnd';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import SamplesContainer from 'components/data-management/SamplesContainer/SamplesContainer';
import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import fake from '__test__/test-utils/constants';
import { makeStore } from 'redux/store';
import { loadSamples } from 'redux/actions/samples';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { loadExperiments, setActiveExperiment } from 'redux/actions/experiments';
import {
  SAMPLES_VALIDATING_UPDATED,
} from 'redux/actionTypes/samples';
import { samples } from '__test__/test-utils/mockData';
import { getTechNameToDisplay } from 'const/enums/SampleTech';
import { updateExperimentInfo } from 'redux/actions/experimentSettings';

const experimentId = `${fake.EXPERIMENT_ID}-0`;
const samplesContainerRef = { current: undefined };

describe('SamplesTableContainer', () => {
  let storeState = null;

  beforeEach(async () => {
    enableFetchMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockClear();
    fetchMock.mockIf(/.*/, mockAPI(generateDefaultMockAPIResponses(experimentId)));

    storeState = makeStore();
    await storeState.dispatch(
      updateExperimentInfo({ experimentId, sampleIds: Object.keys(samples) }),
    );

    await storeState.dispatch(loadExperiments());
    await storeState.dispatch(loadSamples(experimentId));

    await storeState.dispatch(setActiveExperiment(experimentId));

    // await storeState.dispatch(loadSamples(experimentId));
  });
  const renderSamplesTableContainer = () => {
    render(
      <Provider store={storeState}>
        <DndProvider backend={HTML5Backend}>
          <SamplesContainer ref={samplesContainerRef} />
        </DndProvider>
      </Provider>,
    );
  };

  it('Should NOT show the samples until theres validation going on for active experiment', async () => {
    storeState.dispatch({
      type: SAMPLES_VALIDATING_UPDATED,
      payload: { experimentId, validating: true },
    });

    await renderSamplesTableContainer();

    await waitFor(() => {
      Object.values(samples).forEach((sample) => {
        expect(screen.queryByText(sample.name)).not.toBeInTheDocument();
      });
    });
  });

  it('fetches and displays the samples table after loadSamples resolves', async () => {
    // Dispatch the thunk that loads samples (uses our fetchMock)
    await renderSamplesTableContainer();

    // Pick one of our mock samples to assert its name appears
    const firstSample = Object.values(samples)[0];

    await waitFor(() => {
      expect(screen.getByText(firstSample.name)).toBeInTheDocument();
    });

    // The "All" tab should be present
    expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument();
  });

  it('filters the table by technology when a tech-specific tab is clicked', async () => {
    await renderSamplesTableContainer();

    // Wait until the table is populated
    await waitFor(() => {
      expect(screen.getByText(Object.values(samples)[0].name)).toBeInTheDocument();
    });

    // Determine a tech from our mock data
    const allSamples = Object.values(samples);
    const techType = 'parse';
    const techLabel = getTechNameToDisplay(techType);

    const matching = allSamples.filter((s) => s.sampleTechnology === techType);
    const nonMatching = allSamples.filter((s) => s.sampleTechnology !== techType);

    // Click on the tech tab
    userEvent.click(screen.getByRole('tab', { name: techLabel }));

    // Now only matching samples should appear
    await waitFor(() => {
      matching.forEach((s) => {
        expect(screen.getByText(s.name)).toBeInTheDocument();
      });
      nonMatching.forEach((s) => {
        expect(screen.queryByText(s.name)).not.toBeInTheDocument();
      });
    });
  });
});
