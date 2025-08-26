import React from 'react';
import _ from 'lodash';
import { Provider } from 'react-redux';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import Pipeline from 'pages/pipeline/index';
import {
  updateSecondaryAnalysis, setActiveSecondaryAnalysis, storeLoadedAnalysisFile,
} from 'redux/actions/secondaryAnalyses';
import { modules } from 'const';
import '__test__/test-utils/setupTests';
import mockAPI, {
  generateDefaultMockAPIResponses,
  promiseResponse,
} from '__test__/test-utils/mockAPI';
import { makeStore } from 'redux/store';
import { mockAnalysisIds } from '__test__/data/secondaryAnalyses/secondary_analyses';

import userEvent from '@testing-library/user-event';
import endUserMessages from 'utils/endUserMessages';
import SelectReferenceGenome from 'components/secondary-analysis/SelectReferenceGenome';

import mockSecondaryAnalysisStatusDefault from '__test__/data/secondaryAnalyses/secondary_analysis_status_default.json';
import FastqFileType from 'const/enums/FastqFileType';
import KitCategory, { isKitCategory } from 'const/enums/KitCategory';

const readyToLaunchResponses = generateDefaultMockAPIResponses(mockAnalysisIds.readyToLaunch);
const emptyAnalysisResponses = generateDefaultMockAPIResponses(mockAnalysisIds.emptyAnalysis);
const mockAPIResponses = { ...readyToLaunchResponses, ...emptyAnalysisResponses };
const mockNavigateTo = jest.fn();

jest.mock('react-resize-detector', () => (props) => {
  const { children } = props;
  return children({ width: 800, height: 600 });
});

const mockOn = jest.fn();
jest.mock('utils/socketConnection', () => ({
  __esModule: true,
  default: () => new Promise((resolve) => {
    resolve({
      emit: jest.fn(),
      on: mockOn,
      off: jest.fn(),
      id: '5678',
    });
  }),
}));
jest.mock('redux/actions/secondaryAnalyses/storeLoadedAnalysisFile', () => jest.fn(() => ({ type: 'MOCK_ACTION' })));
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
      <Pipeline />
    </Provider>,
  );

  it('renders the Pipeline page and launches an analysis', async () => {
    await renderPipelinePage();

    await waitFor(() => {
      expect(screen.getByText(`Run ID: ${mockAnalysisIds.emptyAnalysis}`)).toBeInTheDocument();
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
    await act(async () => {
      await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));
    });
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
      expect(activeId).toBe(mockAnalysisIds.emptyAnalysis);
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
        modules.SECONDARY_ANALYSIS_OUTPUT,
        { secondaryAnalysisId: mockAnalysisIds.readyToLaunch },
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
      expect(activeId).toBe(mockAnalysisIds.emptyAnalysis);
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

  it('navigates to the status screen if the pipeline is in progress', async () => {
    const inProgressPipelineResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/executionStatus`]: () => promiseResponse(JSON.stringify({
        current: 'running',
        shouldRerun: false,
      })),
    };

    fetchMock.mockIf(/.*/, mockAPI(inProgressPipelineResponse));
    await renderPipelinePage();

    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.emptyAnalysis);
    });

    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));

    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.readyToLaunch);
    });

    await waitFor(() => {
      expect(screen.getByText('Go to output')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByText(/Go to output/i));

    await waitFor(() => {
      expect(mockNavigateTo).toHaveBeenCalledWith(
        modules.SECONDARY_ANALYSIS_OUTPUT,
        { secondaryAnalysisId: mockAnalysisIds.readyToLaunch },
      );
    });
  });

  it('allows rerunning the pipeline if it failed', async () => {
    const failedPipelineResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/executionStatus`]: () => promiseResponse(JSON.stringify({
        current: 'failed',
        shouldRerun: true,
      })),
    };

    fetchMock.mockIf(/.*/, mockAPI(failedPipelineResponse));
    await renderPipelinePage();

    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.emptyAnalysis);
    });

    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));

    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.readyToLaunch);
    });

    await waitFor(() => {
      expect(screen.getByText('Rerun the pipeline')).toBeInTheDocument();
    });
    expect(screen.getByText('Rerun the pipeline').closest('button')).not.toBeDisabled();
  });

  it('Empty runs cannot be launched', async () => {
    const mockApiResponsesEmptyAnalysis = generateDefaultMockAPIResponses(
      mockAnalysisIds.emptyAnalysis,
    );
    fetchMock.mockIf(/.*/, mockAPI(mockApiResponsesEmptyAnalysis));
    await renderPipelinePage();
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.emptyAnalysis);
    });
    await waitFor(() => {
      expect(screen.getByText('Run the pipeline')).toBeInTheDocument();
    });
    expect(screen.getByText('Run the pipeline').closest('button')).toBeDisabled();
  });

  it('Unchanged finished pipelines cannot be rerun', async () => {
    const finishedPipelineResponse = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}/executionStatus`]: () => promiseResponse(JSON.stringify({
        current: 'finished',
        shouldRerun: false,
      })),
    };
    fetchMock.mockIf(/.*/, mockAPI(finishedPipelineResponse));
    await renderPipelinePage();
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.emptyAnalysis);
    });
    await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));
    await waitFor(() => {
      const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
      expect(activeId).toBe(mockAnalysisIds.readyToLaunch);
    });
    await waitFor(() => {
      expect(screen.getByText('Rerun the pipeline').closest('button')).toBeDisabled();
    });
  });

  it('updates file status from socket message', async () => {
    const emptyMockAPIResponses = {
      ...mockAPIResponses,
      [`/v2/secondaryAnalysis/${mockAnalysisIds.emptyAnalysis}/executionStatus`]: () => promiseResponse(
        JSON.stringify(mockSecondaryAnalysisStatusDefault),
      ),
      [`/v2/secondaryAnalysis/${mockAnalysisIds.emptyAnalysis}/files`]: () => promiseResponse(JSON.stringify([])),
    };

    fetchMock
      .mockReset()
      .mockIf(/.*/, mockAPI(emptyMockAPIResponses));

    const message = { file: { id: 'file1', status: 'uploaded' } };

    mockOn.mockImplementation((event, callback) => {
      if (event === `fileUpdates-${mockAnalysisIds.emptyAnalysis}`) {
        callback(message);
      }
    });

    await renderPipelinePage();

    await waitFor(() => {
      expect(storeLoadedAnalysisFile).toHaveBeenCalledWith(
        mockAnalysisIds.emptyAnalysis,
        message.file,
      );
    });
  });

  it('Searches genomes correctly in SelectReferenceGenome component', async () => {
    const mockOnDetailsChanged = jest.fn();

    render(
      <SelectReferenceGenome
        genome={undefined}
        onDetailsChanged={mockOnDetailsChanged}
      />,
    );

    const searchInput = document.querySelector('.ant-select-selection-search input');

    // filter by genome name
    userEvent.type(searchInput, 'GRCh38');

    await waitFor(() => {
      expect(screen.getByText('GRCh38: Homo sapiens (Human)')).toBeInTheDocument();
    });

    // delete previous text (GRCh38) and check that other genomes appear
    userEvent.clear(searchInput);
    await waitFor(() => {
      expect(screen.getByText('GRCm39: Mus musculus (Mouse)')).toBeInTheDocument();
    });

    // search by species
    userEvent.type(searchInput, 'mouse');
    await waitFor(() => {
      expect(screen.getByText('GRCm39: Mus musculus (Mouse)')).toBeInTheDocument();
    });

    // without matching results
    userEvent.type(searchInput, 'thisIsNotAGenome');
    await waitFor(() => {
      expect(screen.queryByText('GRCh38: Homo sapiens (Human)')).not.toBeInTheDocument();
      expect(screen.queryByText('thisIsNotAGenome')).not.toBeInTheDocument();
    });
  });

  describe('Experiments setup', () => {
    const setKitType = async (kit, pairedWt) => {
      // Open Experimental setup wizard step
      await act(() => {
        userEvent.click(screen.getByTestId('edit-button-Experimental setup'));
      });

      // Open the select
      await act(() => {
        fireEvent.mouseDown(screen.getByTestId('experimental-setup-kit-select').firstElementChild);
      });

      await waitFor(() => expect(screen.getByText(kit)).toBeDefined());

      await act(() => {
        fireEvent.click(screen.getByText(kit));
      });

      if (pairedWt === false && !isKitCategory(kit, [KitCategory.WT])) {
        await act(() => {
          fireEvent.click(screen.getByTestId('pairedwt-switch'));
        });

        await waitFor(() => {
          expect(screen.getByText('By disabling this toggle, your uploaded WT files will be recategorized to immune profiling files.')).toBeInTheDocument();
        });

        await act(async () => {
          // Click antd modal's button saying ok
          userEvent.click(screen.getByTestId('pairedwt-false-confirm-button'));
        });

        // Wait for switch to set to false
        await waitFor(() => {
          expect(screen.getByTestId('pairedwt-switch')).toHaveAttribute('aria-checked', 'false');
        });
      }

      await act(async () => {
        // click the button to close the modal to trigger update
        userEvent.click(screen.getByLabelText('Close'));
      });
    };

    it('Updates fastq types as necessary when updating kits', async () => {
      const patchedTypeResponse = {
        ...generateDefaultMockAPIResponses(mockAnalysisIds.readyToLaunch),
        [`/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}`]: () => promiseResponse(
          JSON.stringify([
            { id: '1000fe51-6a6d-4545-b717-a4c475849b94', type: FastqFileType.IMMUNE_FASTQ },
            { id: 'd7ba4d40-e1ed-45a0-9eca-8f5caab0dd7b', type: FastqFileType.IMMUNE_FASTQ },
            { id: 'c28efb10-6459-4107-b9ef-baf6b13968c4', type: FastqFileType.IMMUNE_FASTQ },
            { id: '0740a094-f020-4c97-aceb-d0a708d0982e', type: FastqFileType.IMMUNE_FASTQ },
          ]),
        ),
      };

      fetchMock.mockIf(/.*/, mockAPI(patchedTypeResponse));

      await renderPipelinePage();

      // Wait for selected secondary to be loaded
      await waitFor(() => {
        expect(screen.getByText(/Evercode WT/i)).toBeInTheDocument();
      });

      // All files are not immune (so wt or sample loading)
      const fileTypesPre = _.map(Object.values(storeState.getState().secondaryAnalyses[mockAnalysisIds.readyToLaunch].files.data), 'type');
      expect(fileTypesPre).toEqual([...new Array(4).fill(FastqFileType.WT_FASTQ), 'samplelt']);

      await setKitType('Evercode TCR Mini', false);

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          `http://localhost:3000/v2/secondaryAnalysis/${mockAnalysisIds.readyToLaunch}`,
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({
              numOfSublibraries: 1,
              chemistryVersion: '3',
              kit: 'tcr_mini',
              pairedWt: false,
              immuneDatabase: null,
            }),
          }),
        );
      });

      // Now all files are not wt (so immune or sample loading)
      const fileTypesPost = _.map(Object.values(storeState.getState().secondaryAnalyses[mockAnalysisIds.readyToLaunch].files.data), 'type');
      expect(fileTypesPost).toEqual([...new Array(4).fill(FastqFileType.IMMUNE_FASTQ), 'samplelt']);
    });
  });

  describe('Upload fastq tests', () => {
    const originalGetElementById = document.getElementById;

    let onDropCallback;

    beforeEach(() => {
      document.getElementById = jest.fn().mockReturnValue({
        addEventListener: (event, callback) => { if (event === 'drop') onDropCallback = callback; },
        scrollIntoView: jest.fn(),
        removeEventListener: jest.fn(),
      });
    });

    afterEach(() => {
      document.getElementById = originalGetElementById;
    });

    it('Cant upload non-gzipped fastq files', async () => {
      await renderPipelinePage();

      await storeState.dispatch(setActiveSecondaryAnalysis(mockAnalysisIds.readyToLaunch));

      // switches to run that can be launched
      await waitFor(() => {
        const activeId = storeState.getState().secondaryAnalyses.meta.activeSecondaryAnalysisId;
        expect(activeId).toBe(mockAnalysisIds.readyToLaunch);
      });

      // Fastq files section exists
      userEvent.click(screen.getByText('Fastq files'));

      // Open fastq files modal
      act(() => {
        userEvent.click(screen.getByTestId('edit-button-Fastq files'));
      });

      // Check it opened fastq files modal
      screen.getByText('Upload your FASTQ files:');

      // Assigned a callback for adding files
      expect(onDropCallback).toBeDefined();

      const fileR1 = { kind: 'file', name: 'file_R1.fastq' };
      const fileR2 = { kind: 'file', name: 'file_R2.fastq' };
      const fileR1Drop = { getAsFileSystemHandle: () => fileR1 };
      const fileR2Drop = { getAsFileSystemHandle: () => fileR2 };

      await act(async () => {
        await onDropCallback({
          preventDefault: jest.fn(),
          dataTransfer: { items: [fileR1Drop, fileR2Drop] },
        });
      });

      expect(screen.getByRole('button', { name: /Upload/ })).toBeInTheDocument();

      const ignoredFilesWarning = screen.getByText('2 files were ignored, click to display');
      expect(ignoredFilesWarning).toBeInTheDocument();

      await act(() => {
        userEvent.click(ignoredFilesWarning);
      });

      expect(screen.getAllByText(endUserMessages.ERROR_FASTQ_NOT_GZIPPED).length).toEqual(2);
    });
  });
});
