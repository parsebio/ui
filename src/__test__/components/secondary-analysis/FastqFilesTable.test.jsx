import React from 'react';
import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import FastqFilesTable from 'components/secondary-analysis/FastqFilesTable';
import {
  createSecondaryAnalysisFile, deleteSecondaryAnalysisFile,
  loadSecondaryAnalyses, loadSecondaryAnalysisFiles,
  updateSecondaryAnalysisFile,
} from 'redux/actions/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';
import FastqFileType from 'const/enums/FastqFileType';
import { labelsByFastqType } from 'utils/secondary-analysis/kitOptions';

import mockAPI, {
  generateDefaultMockAPIResponses,
  promiseResponse,
} from '__test__/test-utils/mockAPI';
import { makeStore } from 'redux/store';
import { getFastqFiles } from 'redux/selectors';

import mockAnalysisFiles from '__test__/data/secondaryAnalyses/secondary_analysis_files';

enableFetchMocks();

jest.mock('redux/actions/secondaryAnalyses/deleteSecondaryAnalysisFile', () => jest.fn(() => ({ type: 'MOCK_ACTION' })));

const mockAnalysisId = 'analysis1';

let store;

const renderComponent = (
  {
    canEditTable = true,
    pairedWt = false,
    kit = null,
    secondaryAnalysisId = mockAnalysisId,
  } = {},
) => {
  const immuneFastqFiles = getFastqFiles(
    mockAnalysisId,
    FastqFileType.IMMUNE_FASTQ,
  )(store.getState());

  const wtFastqFiles = getFastqFiles(
    mockAnalysisId,
    FastqFileType.WT_FASTQ,
  )(store.getState());

  const fastqFiles = { ...immuneFastqFiles, ...wtFastqFiles };

  render(
    <Provider store={store}>
      <FastqFilesTable
        files={fastqFiles}
        canEditTable={canEditTable}
        secondaryAnalysisId={secondaryAnalysisId}
        pairedWt={pairedWt}
        kit={kit}
      />
    </Provider>,
  );
};

const mockAPIResponses = generateDefaultMockAPIResponses(mockAnalysisId);

describe('FastqFilesTable', () => {
  const fillStore = async () => {
    await store.dispatch(loadSecondaryAnalyses());
    await store.dispatch(loadSecondaryAnalysisFiles(mockAnalysisId));
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    store = makeStore();
    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockAPIResponses));
  });

  it('renders the FastqFilesTable component correctly', async () => {
    await fillStore();

    renderComponent();

    expect(screen.getByText('S1_R1.fastq.gz')).toBeInTheDocument();
    expect(screen.getByText('S1_R2.fastq.gz')).toBeInTheDocument();
    expect(screen.getByText('S2_R2.fastq.gz')).toBeInTheDocument();
    expect(screen.getByText('S2_R2.fastq.gz')).toBeInTheDocument();
    expect(screen.getAllByText('53.3 MB')).toHaveLength(2);
    expect(screen.getAllByText('66.9 MB')).toHaveLength(2);

    // Doesn't render when pairedWt is false
    expect(screen.queryByText('Type')).not.toBeInTheDocument();
  });

  it('Displays uploading status on new files', async () => {
    await fillStore();

    await act(async () => {
      await store.dispatch(createSecondaryAnalysisFile(
        mockAnalysisId,
        { name: 'new_file.fastq', size: 123456 },
        FastqFileType.WT_FASTQ,
      ));

      await store.dispatch(updateSecondaryAnalysisFile(
        mockAnalysisId,
        'mockFileId',
        UploadStatus.UPLOADING,
        { abortController: jest.fn() },
      ));
    });

    renderComponent();

    expect(screen.getAllByText('Uploaded')).toHaveLength(4);
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('calls deleteSecondaryAnalysisFile when delete is confirmed', async () => {
    await fillStore();

    renderComponent();

    fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[0]);
    fireEvent.click(screen.getByText('Yes'));

    expect(deleteSecondaryAnalysisFile).toHaveBeenCalledWith(mockAnalysisId, '0740a094-f020-4c97-aceb-d0a708d0982e');
  });

  it('does not render delete buttons when canEditTable is false', async () => {
    await fillStore();

    renderComponent({ canEditTable: false });

    expect(screen.queryAllByRole('img', { name: 'delete' })).toHaveLength(0);
  });

  it('calls deleteSecondaryAnalysisFile directly for expired files', async () => {
    const testSecondaryFiles = _.cloneDeep(mockAnalysisFiles);

    _.find(testSecondaryFiles.files, { name: 'S2_R2.fastq.gz' }).upload.status = UploadStatus.EXPIRED;

    const mockTestAPIResponses = _.merge(
      generateDefaultMockAPIResponses(mockAnalysisId),
      {
        [`/v2/secondaryAnalysis/${mockAnalysisId}/files`]: () => promiseResponse(
          JSON.stringify(testSecondaryFiles),
        ),
      },
    );

    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockTestAPIResponses));

    await fillStore();

    renderComponent({ canEditTable: true });

    // the last delete icon corresponds to file3
    fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[0]);

    expect(deleteSecondaryAnalysisFile).toHaveBeenCalledWith(mockAnalysisId, '0740a094-f020-4c97-aceb-d0a708d0982e');
  });

  it('renders the "Type" column when pairedWt is true and shows the correct labels', async () => {
    const testSecondaryFiles = _.cloneDeep(mockAnalysisFiles);

    _.find(testSecondaryFiles.files, { name: 'S2_R2.fastq.gz' }).type = FastqFileType.IMMUNE_FASTQ;
    _.find(testSecondaryFiles.files, { name: 'S2_R1.fastq.gz' }).type = FastqFileType.IMMUNE_FASTQ;

    const mockTestAPIResponses = _.merge(
      generateDefaultMockAPIResponses(mockAnalysisId),
      {
        [`/v2/secondaryAnalysis/${mockAnalysisId}/files`]: () => promiseResponse(
          JSON.stringify(testSecondaryFiles),
        ),
      },
    );

    fetchMock.resetMocks();
    fetchMock.mockIf(/.*/, mockAPI(mockTestAPIResponses));

    await fillStore();

    renderComponent({
      pairedWt: true,
      canEditTable: false,
    });

    expect(screen.getByText('Type')).toBeInTheDocument();

    expect(screen.getAllByText(labelsByFastqType[FastqFileType.WT_FASTQ])).toHaveLength(2);
    expect(screen.getAllByText(labelsByFastqType[FastqFileType.IMMUNE_FASTQ])).toHaveLength(2);
  });

  // TODO Clean this up, no longer necessary
  // it('only shows WT_FASTQ files when kit is WT category, regardless of pairedWt', () => {
  //   renderComponent({
  //     kit: KitCategory.WT,
  //     pairedWt: false,
  //     files: filesWithTypes,
  //   });

  //   expect(screen.getByText('wt.fastq')).toBeInTheDocument();
  //   expect(screen.queryByText('immune.fastq')).not.toBeInTheDocument();
  // });

  // it('only shows IMMUNE_FASTQ files when kit is TCR and pairedWt is false', () => {
  //   renderComponent({
  //     kit: KitCategory.TCR,
  //     pairedWt: false,
  //     files: filesWithTypes,
  //   });

  //   expect(screen.getByText('immune.fastq')).toBeInTheDocument();
  //   expect(screen.queryByText('wt.fastq')).not.toBeInTheDocument();
  // });
});
