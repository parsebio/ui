import React from 'react';
import { Provider } from 'react-redux';

import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import Pipeline from 'pages/pipeline/index';
import {
  updateSecondaryAnalysis, setActiveSecondaryAnalysis,
} from 'redux/actions/secondaryAnalyses';
import { modules } from 'utils/constants';
import '__test__/test-utils/setupTests';
import mockAPI, {
  generateDefaultMockAPIResponses,
  promiseResponse,
} from '__test__/test-utils/mockAPI';
import { makeStore } from 'redux/store';
import { mockAnalysisIds } from '__test__/data/secondaryAnalyses/secondary_analyses';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const mockAPIResponses = generateDefaultMockAPIResponses(mockAnalysisIds.readyToLaunch);
const mockNavigateTo = jest.fn();

jest.mock('react-resize-detector', () => (props) => {
  const { children } = props;
  return children({ width: 800, height: 600 });
});

jest.mock('@aws-amplify/auth', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(() => Promise.resolve({
      attributes: {
        name: 'mockUserName',
        'custom:agreed_terms_v2': 'true',
      },
    })),
    federatedSignIn: jest.fn(),
  },
}));

jest.mock('utils/AppRouteProvider', () => ({
  useAppRouter: jest.fn(() => ({
    navigateTo: mockNavigateTo,
  })),
}));
let storeState;

enableFetchMocks();

describe('Pipeline Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockAPIResponses));
    storeState = makeStore();
  });

  const renderPipelinePage = async () => await render(
    <Provider store={storeState}>
      <DndProvider backend={HTML5Backend}>
        <Pipeline />
        {/* {pipelinePageFactory()} */}
      </DndProvider>
    </Provider>,
  );

  it('renders the Pipeline page and launches an analysis', async () => {
    await renderPipelinePage();
    await waitFor(() => {
      const multiTileContainer = screen.queryByTestId('multi-tile-container');
      expect(multiTileContainer).toBeInTheDocument();
    });

    await waitFor(() => {
      const runId = screen.getByText(/run id/i);
      console.log('runId', runId); // Debugging line
      expect(runId).toBeInTheDocument();
      expect(screen.getByText(/experimental setup/i)).toBeInTheDocument();
      expect(screen.getByText(/sample loading table/i)).toBeInTheDocument();
      expect(screen.getByText(/reference genome/i)).toBeInTheDocument();
      expect(screen.getByText(/fastq files/i)).toBeInTheDocument();
      expect(screen.getByText(/run the pipeline/i)).toBeInTheDocument();
      expect(screen.getByText(/share/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
      expect(screen.getAllByText(/runs/i).length).toBe(3);
      expect(screen.getAllByText(/run details/i).length).toBe(3);
    });

    // filled in analysis should have details shown on the page
    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));
    await waitFor(() => {
      expect(screen.getByText(/File name:/i)).toBeInTheDocument();
      expect(screen.getByText(/pbmc_1Mreads sltab.xlsm/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/S1_R1.fastq.gz/i)).toBeInTheDocument();
    expect(screen.getByText(/S1_R2.fastq.gz/i)).toBeInTheDocument();
    expect(screen.getByText(/S2_R1.fastq.gz/i)).toBeInTheDocument();
    expect(screen.getByText(/S2_R2.fastq.gz/i)).toBeInTheDocument();
    expect(screen.getByText(/Kit type:/i)).toBeInTheDocument();
    expect(screen.getByText(/Evercode WT/i)).toBeInTheDocument();
    expect(screen.getByText(/Chemistry version:/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of sublibraries:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mmul10/i)).toBeInTheDocument();

    // sample names are shown on click
    fireEvent.click(screen.getByText(/View sample names/i));
    expect(screen.getByText(/sample_1/i)).toBeInTheDocument();
    expect(screen.getByText(/sample_2/i)).toBeInTheDocument();
    expect(screen.getByText(/sample_3/i)).toBeInTheDocument();
  });

  it('launches the pipeline', async () => {
    const launchSecondaryAnalysisResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/launch`]: () => promiseResponse(JSON.stringify({ status: 'success' })),
    };

    fetchMock.mockIf(/.*/, mockAPI(launchSecondaryAnalysisResponse));
    await renderPipelinePage();
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.latestTest);
    });

    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));

    // switches to run that can be launched
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.readyToLaunch);
    });

    await waitFor(() => {
      expect(screen.getByText('Run the pipeline')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByText(/Run the pipeline/i));

    await waitFor(() => {
      const numberOfCalls = fetchMock.mock.calls.length - 1;
      expect(fetchMock.mock.calls[numberOfCalls][0]).toContain(`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/launch`);
    });

    await waitFor(() => {
      expect(mockNavigateTo).toHaveBeenCalledWith(
        modules.SECONDARY_ANALYSIS_OUTPUT, { secondaryAnalysisId: mockAnalysisIds.readyToLaunch },
      );
    });
  });

  it('cannot launch pipeline when number of sublibraries does not match FASTQ files', async () => {
    const updateSecondaryAnalysisResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}$`]: () => promiseResponse(JSON.stringify({ status: 'success' })),
    };

    fetchMock.mockIf(/.*/, mockAPI(updateSecondaryAnalysisResponse));
    await renderPipelinePage();
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.latestTest);
    });
    await storeState.dispatch(
      updateSecondaryAnalysis(mockAnalysisIds.readyToLaunch, { numberOfSublibraries: 3 }),
    );
    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.readyToLaunch);
    });

    expect(screen.getByText(/Run the pipeline/i).closest('button')).toBeDisabled();
  });
});
