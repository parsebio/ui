import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import { loadProcessingSettings } from 'redux/actions/experimentSettings';
import { makeStore } from 'redux/store';
import ScanpyDisabler from 'utils/ScanpyDisabler';
import { analysisTools } from 'utils/constants';

import mockAPI, { generateDefaultMockAPIResponses } from '__test__/test-utils/mockAPI';

enableFetchMocks();

describe('ScanpyDisabler', () => {
  let store;
  const experimentId = 'test-experiment';

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.doMock();
  });

  it('Allows children to be interacted with when analysis tool is not Scanpy', async () => {
    fetchMock.mockIf(/.*/, mockAPI(generateDefaultMockAPIResponses(experimentId)));

    store = makeStore();

    await store.dispatch(loadProcessingSettings(experimentId));
    await store.dispatch({
      type: 'EXPERIMENT_SETTINGS_UPDATED',
      payload: {
        processing: {
          dataIntegration: { analysisTool: analysisTools.SEURAT },
        },
      },
    });

    render(
      <Provider store={store}>
        <ScanpyDisabler>
          <div>Test Content</div>
        </ScanpyDisabler>
      </Provider>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).not.toHaveStyle('pointer-events: none');
  });

  it('Disables children and verifies pointer-events is set to none when analysis tool is Scanpy', async () => {
    fetchMock.mockIf(/.*/, mockAPI(generateDefaultMockAPIResponses(experimentId, analysisTools.SCANPY)));

    store = makeStore();

    await store.dispatch(loadProcessingSettings(experimentId));
    await store.dispatch({
      type: 'EXPERIMENT_SETTINGS_UPDATED',
      payload: {
        processing: {
          dataIntegration: { analysisTool: analysisTools.SCANPY },
        },
      },
    });

    render(
      <Provider store={store}>
        <ScanpyDisabler>
          <div>Test Content</div>
        </ScanpyDisabler>
      </Provider>,
    );

    const disabledElement = screen.getByText('Test Content').parentElement;

    expect(disabledElement).toBeInTheDocument();
    expect(disabledElement).toHaveStyle('pointer-events: none');
    expect(disabledElement).toHaveStyle('opacity: 0.5');
  });
});
