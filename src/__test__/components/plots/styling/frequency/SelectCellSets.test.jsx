import React from 'react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { makeStore } from 'redux/store';
import { render, screen, fireEvent } from '@testing-library/react';
import '__test__/test-utils/mockWorkerBackend';

import SelectCellSets from 'components/plots/styling/frequency/SelectCellSets';
import { loadCellSets } from 'redux/actions/cellSets';
import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';
import fake from '__test__/test-utils/constants';
import { initialPlotConfigStates } from 'redux/reducers/componentConfig/initialState';
import createTestComponentFactory from '__test__/test-utils/testComponentFactory';

const mockOnUpdate = jest.fn().mockImplementation(() => {});
const defaultResponses = generateDefaultMockAPIResponses(fake.EXPERIMENT_ID);
const selectCellSetsFactory = createTestComponentFactory(SelectCellSets, {
  onUpdate: mockOnUpdate,
  config: initialPlotConfigStates.frequency,
});

let storeState = null;

describe('Select cell sets tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    enableFetchMocks();
    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(defaultResponses));

    storeState = makeStore();

    storeState.dispatch(loadCellSets(fake.EXPERIMENT_ID));
  });

  it('Renders properly', async () => {
    await act(async () => {
      render(
        <Provider store={storeState}>
          {selectCellSetsFactory()}
        </Provider>,
      );
    });

    // 1st select to select sample
    expect(screen.getByText(/Select the metadata that cells are grouped by/, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'metadata' })).toBeInTheDocument();

    // 2nd to select the group by
    expect(screen.getByText(/Select how the data should be grouped/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'groupBy' })).toBeInTheDocument();
  });

  it('Switching cellsets updates the plot', async () => {
    await act(async () => {
      render(
        <Provider store={storeState}>
          {selectCellSetsFactory()}
        </Provider>,
      );
    });

    const dropdown = screen.getByRole('combobox', { name: 'groupBy' });

    await act(async () => {
      fireEvent.change(dropdown, { target: { value: 'Scratchpad' } });
    });

    const option1 = screen.getByText('Custom cell sets');

    await act(async () => {
      fireEvent.click(option1);
    });

    expect(mockOnUpdate).toHaveBeenCalled();
  });

  it('Changing the metadata group by updates the title of the x axis', async () => {
    await act(async () => {
      render(
        <Provider store={storeState}>
          {selectCellSetsFactory()}
        </Provider>,
      );
    });

    const metadataDropdown = screen.getByRole('combobox', { name: 'metadata' });
    expect(metadataDropdown).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(metadataDropdown, { target: { value: 'Track_1' } });
    });

    const option1 = screen.getByTitle('Track_1', { name: 'Track_1' });

    await act(async () => {
      fireEvent.click(option1);
    });

    expect(mockOnUpdate).toHaveBeenCalled();
  });
});
