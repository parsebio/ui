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
      name: 'some analysis',
      id: 'analysis-1',
      status: {
        current: 'not_created',
        loading: true,
      },
      files: {
        data: {
          '07286c9c-9392-4591-8b1c-c47b355e1108': {
            id: '07286c9c-9392-4591-8b1c-c47b355e1108',
            name: 'S1_R1.fastq.gz',
            size: '70154428',
            type: 'fastq',
            upload: {
              status: {
                current: 'uploaded',
                loading: false,
              },
            },
            createdAt: '2024-07-02 16:00:15.08919+00',
          },
          '1be1689c-0909-496b-bcf9-c29abb3733cf': {
            id: '1be1689c-0909-496b-bcf9-c29abb3733cf',
            name: 'S1_R2.fastq.gz',
            size: '55879599',
            type: 'fastq',
            upload: {
              status: {
                current: 'uploaded',
                loading: false,
              },
            },
            createdAt: '2024-07-02 16:00:16.941129+00',
          },
          '0dc7d6ec-b702-4841-b49a-28ad9f0d29a1': {
            id: '0dc7d6ec-b702-4841-b49a-28ad9f0d29a1',
            name: 'S2_R1.fastq.gz',
            size: '70151802',
            type: 'fastq',
            upload: {
              status: {
                current: 'uploaded',
                loading: false,
              },
            },
            createdAt: '2024-07-02 16:00:18.312718+00',
          },
          'e8040b41-509f-473d-aafe-92d1c27ab2e3': {
            id: 'e8040b41-509f-473d-aafe-92d1c27ab2e3',
            name: 'S2_R2.fastq.gz',
            size: '55879479',
            type: 'fastq',
            upload: {
              status: {
                current: 'uploaded',
                loading: false,
              },
            },
            createdAt: '2024-07-02 16:00:20.056015+00',
          },
          sampleltfile: {
            id: 'smaplelt',
            name: 'samplelt.xlsm',
            upload: {
              status: {
                current: 'uploaded',
                loading: false,
              },
            },
            type: 'samplelt',
          },
        },
        loading: false,
        error: false,
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

  it('renders the Pipeline page', () => {
    renderPipelinePage();

    expect(screen.getByText(/Run ID/i)).toBeInTheDocument();
  });

  it('uploads files correctly', async () => {
    renderPipelinePage();

    fireEvent.click(screen.getByText(/Upload your sample loading table/i));

    const uploadInput = screen.getByLabelText(/Upload/i);

    const file = new File(['sample data'], 'sample.lt', {
      type: 'text/plain',
    });

    fireEvent.change(uploadInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/Sample File/i)).toBeInTheDocument();
    });
  });

  it('launches the analysis', async () => {
    const { navigateTo } = useAppRouter();

    const mockState = {
      ...initialState,
      secondaryAnalyses: {
        ...initialState.secondaryAnalyses,
        'analysis-1': {
          ...initialState.secondaryAnalyses['analysis-1'],
          status: {
            loading: false,
            shouldRerun: false,
            current: 'not_created',
          },
        },
      },
    };

    const newStore = mockStore(mockState);

    renderPipelinePage(newStore);

    fireEvent.click(screen.getByRole('button', { name: /Run the pipeline/i }));

    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalledWith(modules.SECONDARY_ANALYSIS_OUTPUT, { secondaryAnalysisId: 'analysis-1' });
    });
  });

  it('updates secondary analysis details', async () => {
    const mockState = {
      ...initialState,
      secondaryAnalyses: {
        ...initialState.secondaryAnalyses,
        'analysis-1': {
          ...initialState.secondaryAnalyses['analysis-1'],
          status: {
            loading: false,
            shouldRerun: false,
            current: 'not_created',
          },
        },
      },
    };

    const newStore = mockStore(mockState);

    renderPipelinePage(newStore);

    fireEvent.click(screen.getByText(/Provide the details of the experimental setup/i));

    const input = screen.getByPlaceholderText(/Enter details/i);

    fireEvent.change(input, {
      target: { value: 'New Analysis Details' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() => {
      expect(newStore.getActions()).toContainEqual({
        type: 'UPDATE_SECONDARY_ANALYSIS',
        payload: {
          id: 'analysis-1',
          details: { description: 'New Analysis Details' },
        },
      });
    });
  });

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

    fireEvent.click(screen.getByRole('button', { name: /Go to output/i }));

    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalledWith(modules.SECONDARY_ANALYSIS_OUTPUT, { secondaryAnalysisId: 'analysis-1' }, false, true);
    });
  });
});
