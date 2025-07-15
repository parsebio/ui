import React from 'react';
import {
  render, screen, fireEvent, within,
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

const openAndSelect = () => {

};

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
});
