import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import _ from 'lodash';
import { useAppRouter } from 'utils/AppRouteProvider';
import createTestComponentFactory from '__test__/test-utils/testComponentFactory';
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
        loading: false,
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
          samplelt: {
            id: 'samplelt',
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
};

const store = mockStore(initialState);

enableFetchMocks();
const route = 'pipeline';
const defaultProps = { route };
const pipelinePageFactory = createTestComponentFactory(Pipeline, defaultProps);

describe('Pipeline Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
  });

  const renderPipelinePage = async (currentStore = store) => await render(
    <Provider store={currentStore}>
      {pipelinePageFactory()}
    </Provider>,
  );

  it('renders the Pipeline page and checks elements', async () => {
    await renderPipelinePage();

    await waitFor(() => {
      const multiTileContainer = screen.queryByTestId('multi-tile-container');
      expect(multiTileContainer).toBeInTheDocument();
    });

    await waitFor(() => {
      const runId = screen.getByText(/create run to get started/i);
      console.log('runId', runId); // Debugging line
      expect(runId).toBeInTheDocument();
    });

    // Additional assertions or actions can be added here
  });

  // it('launches the pipeline', async () => {
  //   const { navigateTo } = useAppRouter();

  //   const mockState = {
  //     ...initialState,
  //     secondaryAnalyses: {
  //       ...initialState.secondaryAnalyses,
  //       'analysis-1': {
  //         ...initialState.secondaryAnalyses['analysis-1'],
  //         status: {
  //           loading: false,
  //           shouldRerun: false,
  //           current: 'not_created',
  //         },
  //       },
  //     },
  //   };

  //   const newStore = mockStore(mockState);

  //   await renderPipelinePage(newStore);
  //   await waitFor(() => {
  //     expect(screen.getByText('Run the pipeline')).toBeInTheDocument();
  //   });
  //   fireEvent.click(screen.getByText('Run the pipeline'));

  //   await waitFor(() => {
  //     expect(navigateTo).toHaveBeenCalledWith(modules.SECONDARY_ANALYSIS_OUTPUT, { secondaryAnalysisId: 'analysis-1' });
  //   });
  // });
});
