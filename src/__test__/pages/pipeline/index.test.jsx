import React from 'react';
import { Provider } from 'react-redux';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import _ from 'lodash';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAppRouter } from 'utils/AppRouteProvider';

import Pipeline from 'pages/pipeline/index';
import {
  loadSecondaryAnalyses, loadSecondaryAnalysisFiles,
  loadSecondaryAnalysisStatus, launchSecondaryAnalysis,
} from 'redux/actions/secondaryAnalyses';
import { getSampleLTFile, getFastqFiles } from 'redux/selectors';
import { modules } from 'utils/constants';
import '__test__/test-utils/setupTests';

const mockStore = configureMockStore([thunk]);

jest.mock('redux/actions/secondaryAnalyses', () => ({
  loadSecondaryAnalyses: jest.fn(() => ({ type: 'LOAD_SECONDARY_ANALYSES' })),
  loadSecondaryAnalysisFiles: jest.fn(() => ({ type: 'LOAD_SECONDARY_ANALYSIS_FILES' })),
  loadSecondaryAnalysisStatus: jest.fn(() => ({ type: 'LOAD_SECONDARY_ANALYSIS_STATUS' })),
}));

jest.mock('redux/selectors', () => ({
  getSampleLTFile: jest.fn(() => (state) => state.samples.sampleLTFile),
  getFastqFiles: jest.fn(() => (state) => state.samples.fastqFiles),
}));

jest.mock('utils/AppRouteProvider', () => ({
  useAppRouter: jest.fn(() => ({
    navigateTo: jest.fn(),
  })),
}));

const initialState = {
  user: {
    current: { id: 'user-1', name: 'mockUserName', attributes: { 'custom:agreed_terms_v2': 'true' } },
  },
  secondaryAnalyses: {
    meta: {
      initialLoadPending: true,
      activeSecondaryAnalysisId: 'analysis-1',
    },
    'analysis-1': {
      status: {
        current: 'not_created',
        loading: true,
      },
      files: {
        data: null,
      },
    },
  },
  networkResources: {
    domainName: 'testing',
  },
  samples: {
    sampleLTFile: {
      id: 'file-1', name: 'Sample File', upload: { status: { current: 'uploaded' } }, createdAt: '2022-01-01T00:00:00Z',
    },
    fastqFiles: { 'file-2': { id: 'file-2', name: 'Fastq File', upload: { status: { current: 'uploaded' } } } },
  },
};

const store = mockStore(initialState);

enableFetchMocks();

describe('Pipeline Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
  });

  const renderPipelinePage = (currentStore = store) => render(
    <DndProvider backend={HTML5Backend}>
      <Provider store={currentStore}>
        <Pipeline />
      </Provider>
    </DndProvider>,
  );

  // it('renders loading state initially', () => {
  //   renderPipelinePage();
  //   expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  // });

  // it('loads secondary analyses on mount', async () => {
  //   renderPipelinePage();
  //   await waitFor(() => {
  //     expect(loadSecondaryAnalyses).toHaveBeenCalled();
  //   });
  // });

  // it('loads secondary analysis files and status when activeSecondaryAnalysisId is set', async () => {
  //   renderPipelinePage();
  //   await waitFor(() => {
  //     expect(loadSecondaryAnalysisFiles).toHaveBeenCalledWith('analysis-1');
  //     expect(loadSecondaryAnalysisStatus).toHaveBeenCalledWith('analysis-1');
  //   });
  // });

  // it('renders the main screen details correctly', async () => {
  //   renderPipelinePage();

  //   await waitFor(() => {
  //     expect(screen.getByText(/Sample File/i)).toBeInTheDocument();
  //     expect(screen.getByText(/Fastq File/i)).toBeInTheDocument();
  //   });
  // });

  // it('renders the correct buttons and handles clicks', async () => {
  //   renderPipelinePage();

  //   await waitFor(() => {
  //     expect(screen.getByText(/Run the pipeline/i)).toBeInTheDocument();
  //   });

  //   fireEvent.click(screen.getByText(/Run the pipeline/i));

  //   await waitFor(() => {
  //     expect(launchSecondaryAnalysis).toHaveBeenCalledWith('analysis-1');
  //   });
  // });

  it('navigates to the correct module on button click', async () => {
    const { navigateTo } = useAppRouter();

    // Mock necessary state values
    const mockState = {
      ...initialState,
      secondaryAnalyses: {
        ...initialState.secondaryAnalyses,
        'analysis-1': {
          ...initialState.secondaryAnalyses['analysis-1'],
          status: {
            loading: false,
            shouldRerun: false,
            current: 'finished',
          },
        },
      },
    };

    const newStore = mockStore(mockState);

    renderPipelinePage(newStore);

    fireEvent.click(screen.getByText(/Go to output/i));

    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalledWith(modules.SECONDARY_ANALYSIS_OUTPUT, { secondaryAnalysisId: 'analysis-1' }, false, true);
    });
  });
});
