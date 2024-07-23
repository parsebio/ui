import React from 'react';
import { Provider } from 'react-redux';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import PipelineLogsViewer from 'components/secondary-analysis/PipelineLogsViewer';
import { setActiveSecondaryAnalysis } from 'redux/actions/secondaryAnalyses';
import '__test__/test-utils/setupTests';
import mockAPI, {
  generateDefaultMockAPIResponses,
  promiseResponse,
} from '__test__/test-utils/mockAPI';
import { makeStore } from 'redux/store';
import { mockAnalysisIds } from '__test__/data/secondaryAnalyses/secondary_analyses';

const mockAPIResponses = generateDefaultMockAPIResponses(mockAnalysisIds.readyToLaunch);

enableFetchMocks();

describe('PipelineLogsViewer', () => {
  let storeState;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockAPIResponses));
    storeState = makeStore();
  });

  const renderPipelineLogsViewer = async () => await render(
    <Provider store={storeState}>
      <PipelineLogsViewer />
    </Provider>,
  );

  it('renders the PipelineLogsViewer component correctly', async () => {
    await renderPipelineLogsViewer();

    await waitFor(() => {
      expect(screen.getByText('Pipeline Logs')).toBeInTheDocument();
      expect(screen.getByText('No logs available')).toBeInTheDocument();
    });
  });

  it('displays logs when available', async () => {
    const logsResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/logs`]: () => promiseResponse(JSON.stringify({
        logs: [
          { timestamp: '2023-01-01T00:00:00Z', message: 'Log message 1' },
          { timestamp: '2023-01-01T01:00:00Z', message: 'Log message 2' },
        ],
      })),
    };

    fetchMock.mockIf(/.*/, mockAPI(logsResponse));
    await renderPipelineLogsViewer();

    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));

    await waitFor(() => {
      expect(screen.getByText('Log message 1')).toBeInTheDocument();
      expect(screen.getByText('Log message 2')).toBeInTheDocument();
    });
  });

  it('handles log refresh', async () => {
    const logsResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/logs`]: () => promiseResponse(JSON.stringify({
        logs: [
          { timestamp: '2023-01-01T00:00:00Z', message: 'Log message 1' },
        ],
      })),
    };

    fetchMock.mockIf(/.*/, mockAPI(logsResponse));
    await renderPipelineLogsViewer();

    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));

    await waitFor(() => {
      expect(screen.getByText('Log message 1')).toBeInTheDocument();
    });

    const updatedLogsResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/logs`]: () => promiseResponse(JSON.stringify({
        logs: [
          { timestamp: '2023-01-01T00:00:00Z', message: 'Log message 1' },
          { timestamp: '2023-01-01T01:00:00Z', message: 'Log message 2' },
        ],
      })),
    };

    fetchMock.mockIf(/.*/, mockAPI(updatedLogsResponse));

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(screen.getByText('Log message 2')).toBeInTheDocument();
    });
  });
});
