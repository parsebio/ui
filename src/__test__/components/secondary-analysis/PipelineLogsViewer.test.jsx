import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import PipelineLogsViewer from 'components/secondary-analysis/PipelineLogsViewer';
import { setActiveSecondaryAnalysis, loadSecondaryAnalysisStatus, loadSecondaryAnalyses } from 'redux/actions/secondaryAnalyses';
import '__test__/test-utils/setupTests';
import mockAPI, {
  generateDefaultMockAPIResponses,
  promiseResponse,
} from '__test__/test-utils/mockAPI';
import { makeStore } from 'redux/store';
import { mockAnalysisIds } from '__test__/data/secondaryAnalyses/secondary_analyses';
import mockSecondaryAnalysisLogs from '__test__/data/secondaryAnalyses/secondary_analysis_logs.json';
import mockSecondaryAnalysisStatusFinished from '__test__/data/secondaryAnalyses/secondary_analysis_status_finished.json';
import _ from 'lodash';

const customResponses = {
  [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/executionStatus`]: () => promiseResponse(JSON.stringify(mockSecondaryAnalysisStatusFinished)),
};
const mockAPIResponses = _.merge(
  generateDefaultMockAPIResponses(mockAnalysisIds.readyToLaunch),
  customResponses,
);

enableFetchMocks();

describe('PipelineLogsViewer', () => {
  let storeState;

  beforeEach(async () => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockAPIResponses));
    storeState = makeStore();
    await storeState.dispatch(loadSecondaryAnalyses());
    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));
    await storeState.dispatch(loadSecondaryAnalysisStatus(mockAnalysisIds.readyToLaunch));
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.readyToLaunch);
    });
  });

  const renderPipelineLogsViewer = async () => await render(
    <Provider store={storeState}>
      <PipelineLogsViewer secondaryAnalysisId={mockAnalysisIds.readyToLaunch} />
    </Provider>,
  );

  it('renders the PipelineLogsViewer component correctly', async () => {
    await renderPipelineLogsViewer();

    await waitFor(() => {
      expect(screen.getByText(/Pipeline Logs:/i)).toBeInTheDocument();
      expect(screen.getByText(/Select a sublibrary/i)).toBeInTheDocument();
    });
  });

  it('displays logs when available and handles refresh', async () => {
    const logsResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/task/17/logs`]: () => promiseResponse(JSON.stringify(
        mockSecondaryAnalysisLogs,
      )),
    };

    fetchMock.mockIf(/.*/, mockAPI(logsResponse));
    await renderPipelineLogsViewer();

    const sublibrarySelect = screen.getByRole('combobox');

    userEvent.click(sublibrarySelect);
    userEvent.click(screen.getAllByText(/s2_S2/)[1]);

    await waitFor(() => {
      expect(screen.getAllByText(/Molinfo processed 6400000 aligned reads/i).length).toBe(11);
    });

    const updatedLogsResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/task/17/logs`]: () => promiseResponse(JSON.stringify(['new log fetched mock'])),
    };

    fetchMock.mockIf(/.*/, mockAPI(updatedLogsResponse));

    const refreshButton = screen.getByTestId('refresh-logs-button');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('new log fetched mock')).toBeInTheDocument();
    });
  });
});
