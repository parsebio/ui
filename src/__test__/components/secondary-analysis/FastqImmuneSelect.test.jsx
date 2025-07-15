import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FastqImmuneSelect from 'components/secondary-analysis/FastqImmuneSelect';
import { updatePairMatch } from 'redux/actions/secondaryAnalyses';
import FastqFileType from 'const/enums/FastqFileType';

jest.mock('redux/actions/secondaryAnalyses', () => ({
  updatePairMatch: jest.fn(() => ({ type: 'MOCK_ACTION' })),
}));

const mockStore = configureMockStore([thunk]);

describe('FastqImmuneSelect', () => {
  let store;
  let pairs;

  beforeEach(() => {
    store = mockStore({
      secondaryAnalyses: {
        meta: { activeSecondaryAnalysisId: 'analysis1' },
        analysis1: {
          files: {
            pairMatches: {},
          },
        },
      },
    });
    pairs = {
      [FastqFileType.IMMUNE_FASTQ]: {
        immune1: {},
        immune2: {},
        immune3: {},
      },
      [FastqFileType.WT_FASTQ]: {
        wt1: {},
      },
    };
    jest.clearAllMocks();
  });

  it('renders all immune options and highlights used ones', () => {
    render(
      <Provider store={store}>
        <FastqImmuneSelect wtPairName='wt1' pairs={pairs} />
      </Provider>,
    );
    // All immune options should be in the dropdown
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getAllByText('immune1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('immune2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('immune3').length).toBeGreaterThan(0);
  });

  it('shows used immune pairs as colored options', () => {
    // immune2 is already matched
    store = mockStore({
      secondaryAnalyses: {
        meta: { activeSecondaryAnalysisId: 'analysis1' },
        analysis1: {
          files: {
            pairMatches: { immune2: 'wt1' },
          },
        },
      },
    });
    render(
      <Provider store={store}>
        <FastqImmuneSelect wtPairName='wt1' pairs={pairs} />
      </Provider>,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    // immune2 should be present and styled (color is not testable, but label is)
    expect(screen.getAllByText('immune2').length).toEqual(2);
  });

  it('dispatches updatePairMatch when a new immune pair is selected', () => {
    render(
      <Provider store={store}>
        <FastqImmuneSelect wtPairName='wt1' pairs={pairs} />
      </Provider>,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getAllByText('immune1')[1]);
    expect(updatePairMatch).toHaveBeenCalledWith(
      'analysis1',
      expect.objectContaining({ immune1: 'wt1' }),
      pairs,
    );
  });

  it('does not dispatch updatePairMatch if the same immune pair is selected again', () => {
    store = mockStore({
      secondaryAnalyses: {
        meta: { activeSecondaryAnalysisId: 'analysis1' },
        analysis1: {
          files: {
            pairMatches: { immune1: 'wt1' },
          },
        },
      },
    });
    render(
      <Provider store={store}>
        <FastqImmuneSelect wtPairName='wt1' pairs={pairs} />
      </Provider>,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getAllByText('immune1')[1]);
    expect(updatePairMatch).not.toHaveBeenCalled();
  });

  it('removes previous match when a new immune pair is selected', () => {
    store = mockStore({
      secondaryAnalyses: {
        meta: { activeSecondaryAnalysisId: 'analysis1' },
        analysis1: {
          files: {
            pairMatches: { immune2: 'wt1' },
          },
        },
      },
    });
    render(
      <Provider store={store}>
        <FastqImmuneSelect wtPairName='wt1' pairs={pairs} />
      </Provider>,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getAllByText('immune1')[1]);
    // Should remove immune2 and add immune1
    expect(updatePairMatch).toHaveBeenCalledWith(
      'analysis1',
      expect.not.objectContaining({ immune2: 'wt1' }),
      pairs,
    );
    expect(updatePairMatch).toHaveBeenCalledWith(
      'analysis1',
      expect.objectContaining({ immune1: 'wt1' }),
      pairs,
    );
  });
});
