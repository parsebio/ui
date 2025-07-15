import React from 'react';
import { render, screen } from '@testing-library/react';
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
} from '__test__/test-utils/mockAPI';
import { mockAnalysisIds } from '__test__/data/secondaryAnalyses/secondary_analyses';

import FastqPairsMatcher from 'components/secondary-analysis/FastqPairsMatcher';

const readyToLaunchResponses = generateDefaultMockAPIResponses(mockAnalysisIds.readyToLaunch);
const emptyAnalysisResponses = generateDefaultMockAPIResponses(mockAnalysisIds.emptyAnalysis);
const mockAPIResponses = { ...emptyAnalysisResponses, ...readyToLaunchResponses };

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
});
