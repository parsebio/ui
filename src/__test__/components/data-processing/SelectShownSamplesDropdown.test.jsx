import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { loadSamples } from 'redux/actions/samples';
import SelectShownSamplesDropdown from 'components/data-processing/SelectShownSamplesDropdown';
import mockAPI, {
  generateDefaultMockAPIResponses,
} from '__test__/test-utils/mockAPI';
import updateExperimentInfo from 'redux/actions/experimentSettings/updateExperimentInfo';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import fake from '__test__/test-utils/constants';
import { makeStore } from 'redux/store';

describe('SelectShownSamplesDropdown', () => {
  let storeState;
  beforeEach(async () => {
    enableFetchMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();

    fetchMock.mockIf(/.*/, mockAPI(generateDefaultMockAPIResponses(fake.EXPERIMENT_ID)));
    storeState = makeStore();

    await storeState.dispatch(updateExperimentInfo({ sampleIds: [`${fake.SAMPLE_ID}-0`, `${fake.SAMPLE_ID}-1`, `${fake.SAMPLE_ID}-2`] }));
  });

  it('renders correctly', async () => {
    await storeState.dispatch(loadSamples(fake.EXPERIMENT_ID));
    const { getByText } = render(
      <Provider store={storeState}>
        <SelectShownSamplesDropdown
          shownSampleIds={[]}
          setShownSampleIds={jest.fn()}
          experimentId={fake.EXPERIMENT_ID}
        />
      </Provider>,
    );
    expect(getByText('Select samples')).toBeInTheDocument();
  });

  it('updates shownSampleIds and shownMetadata on selection change', async () => {
    await storeState.dispatch(loadSamples(fake.EXPERIMENT_ID));

    const setShownSampleIds = jest.fn();
    const { getByText, getByTitle } = render(
      <Provider store={storeState}>
        <SelectShownSamplesDropdown
          shownSampleIds={[]}
          setShownSampleIds={setShownSampleIds}
          experimentId={fake.EXPERIMENT_ID}
        />
      </Provider>,
    );

    const treeSelect = getByText('Select samples');
    fireEvent.mouseDown(treeSelect);

    const sampleOption = getByTitle('Mock sample 0');
    fireEvent.click(sampleOption);

    expect(setShownSampleIds).toHaveBeenCalledWith([`${fake.SAMPLE_ID}-0`]);
  });

  it('selecting metadata track selects its corresponding samples', async () => {
    await storeState.dispatch(loadSamples(fake.EXPERIMENT_ID));

    const setShownSampleIds = jest.fn();
    const { getByText, getAllByTitle } = render(
      <Provider store={storeState}>
        <SelectShownSamplesDropdown
          shownSampleIds={[]}
          setShownSampleIds={setShownSampleIds}
          experimentId={fake.EXPERIMENT_ID}
        />
      </Provider>,
    );

    const treeSelect = getByText('Select samples');
    fireEvent.mouseDown(treeSelect);

    const metadataOption = getAllByTitle('BL')[0];
    fireEvent.click(metadataOption);

    expect(setShownSampleIds).toHaveBeenCalledWith([`${fake.SAMPLE_ID}-0`, `${fake.SAMPLE_ID}-1`, `${fake.SAMPLE_ID}-2`]);
  });

  it('does not crash if there are no samples loaded', () => {
    const setShownSampleIds = jest.fn();
    const { getByText } = render(
      <Provider store={storeState}>
        <SelectShownSamplesDropdown
          shownSampleIds={[]}
          setShownSampleIds={setShownSampleIds}
          experimentId={fake.EXPERIMENT_ID}
        />
      </Provider>,
    );

    expect(getByText('Select samples')).toBeInTheDocument();
  });
});
