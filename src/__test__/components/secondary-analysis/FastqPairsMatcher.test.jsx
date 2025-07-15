import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { makeStore } from 'redux/store';
import {
  loadSecondaryAnalyses,
  loadSecondaryAnalysisFiles,
  loadSecondaryAnalysisStatus,
  setActiveSecondaryAnalysis,
} from 'redux/actions/secondaryAnalyses';
import mockAPI, {
  generateDefaultMockAPIResponses,
  promiseResponse,
} from '__test__/test-utils/mockAPI';
import { mockAnalysisIds } from '__test__/data/secondaryAnalyses/secondary_analyses';

import FastqPairsMatcher from 'components/secondary-analysis/FastqPairsMatcher';
import mockAnalysisFilesWithImmune from '__test__/data/secondaryAnalyses/secondary_analysis_files_with_immune';

const readyToLaunchResponses = generateDefaultMockAPIResponses(mockAnalysisIds.readyToLaunch);
const emptyAnalysisResponses = generateDefaultMockAPIResponses(mockAnalysisIds.emptyAnalysis);
const mockAPIResponses = {
  ...emptyAnalysisResponses,
  ...readyToLaunchResponses,
  [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/files`]: () => promiseResponse(
    JSON.stringify(mockAnalysisFilesWithImmune),
  ),
};

enableFetchMocks();

describe('FastqPairsMatcher', () => {
  let storeState;

  const renderSelect = async () => await render(
    <Provider store={storeState}>
      <FastqPairsMatcher />
    </Provider>,
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockAPIResponses));
    storeState = makeStore();
    await storeState.dispatch(loadSecondaryAnalyses());
    await storeState.dispatch(loadSecondaryAnalysisFiles(mockAnalysisIds.readyToLaunch));
    await storeState.dispatch(loadSecondaryAnalysisStatus(mockAnalysisIds.readyToLaunch));

    await act(async () => {
      await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));
    });
  });

  it('Renders correctly', async () => {
    await renderSelect();
    // Correct sublibrary numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Correct fastq sublibrary numbers
    expect(screen.getByText('S1')).toBeInTheDocument();
    expect(screen.getByText('S2')).toBeInTheDocument();

    // Two empty selects for immune pairs
    expect(screen.getAllByText('Select immune pair')).toHaveLength(2);
  });

  it('Selecting functionality works fine', async () => {
    await renderSelect();

    // Not selected first
    expect(document.querySelector('.ant-select-selection-item[title="TCR_S1"]')).not.toBeInTheDocument();
    expect(document.querySelector('.ant-select-selection-item[title="TCR_S2"]')).not.toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');

    // Open the first immune select dropdown and select the first immune pair
    fireEvent.mouseDown(selects[0]);
    const tcrS1Option = screen.getAllByText('TCR_S1')[1];

    await act(() => {
      fireEvent.click(tcrS1Option);
    });

    expect(document.querySelector('.ant-select-selection-item[title="TCR_S1"]')).toBeInTheDocument();

    // Open the second immune select dropdown and select the second immune pair
    fireEvent.mouseDown(selects[1]);
    const tcrS2Option = screen.getAllByText('TCR_S2')[1];

    await act(() => {
      fireEvent.click(tcrS2Option);
    });

    expect(document.querySelector('.ant-select-selection-item[title="TCR_S2"]')).toBeInTheDocument();

    // Check that updatePairMatch's URL was called for each selection
    const calls = fetchMock.mock.calls.filter(([url]) => (
      url.includes(`${mockAnalysisIds.readyToLaunch}/files/pairMatches`)
    ));

    expect(calls).toHaveLength(2);

    expect(calls[0]).toMatchSnapshot();
    expect(calls[1]).toMatchSnapshot();
  });

  it('Loads the files correctly', async () => {
    await renderSelect();

    // Two empty selects for immune pairs
    expect(screen.getAllByText('Select immune pair')).toHaveLength(2);

    // Mock the files endpoint to return pre-filled pairMatches
    const prefilledPairMatches = {
      ...mockAnalysisFilesWithImmune,
      pairMatches: [
        {
          wtFileR1Id: '1000fe51-6a6d-4545-b717-a4c475849b94',
          wtFileR2Id: 'd7ba4d40-e1ed-45a0-9eca-8f5caab0dd7b',
          immuneFileR1Id: '1000fe51-6a6d-4545-b717-a4c475849b95',
          immuneFileR2Id: 'd7ba4d40-e1ed-45a0-9eca-8f5caab0dd7c',
        },
        {
          wtFileR1Id: 'c28efb10-6459-4107-b9ef-baf6b13968c4',
          wtFileR2Id: '0740a094-f020-4c97-aceb-d0a708d0982e',
          immuneFileR1Id: 'c28efb10-6459-4107-b9ef-baf6b13968c5',
          immuneFileR2Id: '0740a094-f020-4c97-aceb-d0a708d0982f',
        },
      ],
    };

    // Override fetchMock for this test only
    fetchMock
      .mockReset()
      .mockIf(
        /.*/,
        mockAPI({
          ...mockAPIResponses,
          [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/files`]: () => promiseResponse(
            JSON.stringify(prefilledPairMatches),
          ),
        }),
      );

    await act(async () => {
      await storeState.dispatch(loadSecondaryAnalysisFiles(mockAnalysisIds.readyToLaunch));
    });

    // Now options are set
    expect(screen.queryAllByText('Select immune pair').length).toBe(0);
    expect(screen.queryByText('TCR_S1')).toBeInTheDocument();
    expect(screen.queryByText('TCR_S2')).toBeInTheDocument();
  });
});
