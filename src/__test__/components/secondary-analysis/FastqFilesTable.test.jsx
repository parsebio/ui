import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FastqFilesTable from 'components/secondary-analysis/FastqFilesTable';
import { deleteSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';
import FastqFileType from 'const/enums/FastqFileType';
import { labelsByFastqType } from 'utils/secondary-analysis/kitOptions';
import KitCategory from 'const/enums/KitCategory';

jest.mock('redux/actions/secondaryAnalyses/deleteSecondaryAnalysisFile', () => jest.fn(() => ({ type: 'MOCK_ACTION' })));

const mockStore = configureMockStore([thunk]);

// base files without types, used for existing tests
const files = {
  file1: {
    id: 'file1',
    name: 'file1.fastq',
    size: 123456,
    upload: {
      status: { current: 'uploaded' },
      percentProgress: 100,
    },
  },
  file2: {
    id: 'file2',
    name: 'file2.fastq',
    size: 654321,
    upload: {
      status: { current: 'uploading' },
      percentProgress: 50,
    },
  },
};

const filesWithTypes = {
  wt: {
    id: 'wt',
    name: 'wt.fastq',
    size: 111111,
    type: FastqFileType.WT_FASTQ,
    upload: {
      status: { current: 'uploaded' },
      percentProgress: 100,
    },
  },
  immune: {
    id: 'immune',
    name: 'immune.fastq',
    size: 222222,
    type: FastqFileType.IMMUNE_FASTQ,
    upload: {
      status: { current: 'uploaded' },
      percentProgress: 100,
    },
  },
};

const renderComponent = (
  store,
  {
    canEditTable = true,
    pairedWt = false,
    kit = null,
    filesProp = files,
    secondaryAnalysisId = 'analysis1',
  } = {},
) => render(
  <Provider store={store}>
    <FastqFilesTable
      files={filesProp}
      canEditTable={canEditTable}
      secondaryAnalysisId={secondaryAnalysisId}
      pairedWt={pairedWt}
      kit={kit}
    />
  </Provider>,
);

describe('FastqFilesTable', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  it('renders the FastqFilesTable component correctly', () => {
    renderComponent(store);

    expect(screen.getByText('file1.fastq')).toBeInTheDocument();
    expect(screen.getByText('file2.fastq')).toBeInTheDocument();
    expect(screen.getByText('120.6 KB')).toBeInTheDocument();
    expect(screen.getByText('639.0 KB')).toBeInTheDocument();
  });

  it('displays the correct upload status and progress', () => {
    renderComponent(store);

    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  it('calls deleteSecondaryAnalysisFile when delete is confirmed', () => {
    renderComponent(store);

    fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[0]);
    fireEvent.click(screen.getByText('Yes'));

    expect(deleteSecondaryAnalysisFile).toHaveBeenCalledWith('analysis1', 'file1');
  });

  it('does not render delete buttons when canEditTable is false', () => {
    renderComponent(store, { canEditTable: false });

    expect(screen.queryAllByRole('img', { name: 'delete' })).toHaveLength(0);
  });

  it('calls deleteSecondaryAnalysisFile directly for expired files', () => {
    const expiredFiles = {
      ...files,
      file3: {
        id: 'file3',
        name: 'file3.fastq',
        size: 123456,
        upload: {
          status: { current: UploadStatus.EXPIRED },
          percentProgress: 0,
        },
      },
    };

    renderComponent(store, { filesProp: expiredFiles, canEditTable: true });

    // the third delete icon corresponds to file3
    fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[2]);

    expect(deleteSecondaryAnalysisFile).toHaveBeenCalledWith('analysis1', 'file3');
  });

  it('renders the "Type" column when pairedWt is true and shows the correct labels', () => {
    renderComponent(store, {
      pairedWt: true,
      filesProp: filesWithTypes,
    });

    expect(screen.getByText('Type')).toBeInTheDocument();

    expect(screen.getByText(labelsByFastqType[FastqFileType.WT_FASTQ])).toBeInTheDocument();
    expect(screen.getByText(labelsByFastqType[FastqFileType.IMMUNE_FASTQ])).toBeInTheDocument();
  });

  it('does not render the "Type" column when pairedWt is false', () => {
    renderComponent(store, {
      pairedWt: false,
      filesProp: filesWithTypes,
    });

    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    Object.values(labelsByFastqType).forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
  });

  it('only shows WT_FASTQ files when kit is WT category, regardless of pairedWt', () => {
    renderComponent(store, {
      kit: KitCategory.WT,
      pairedWt: false,
      filesProp: filesWithTypes,
    });

    expect(screen.getByText('wt.fastq')).toBeInTheDocument();
    expect(screen.queryByText('immune.fastq')).not.toBeInTheDocument();
  });

  it('only shows IMMUNE_FASTQ files when kit is TCR and pairedWt is false', () => {
    renderComponent(store, {
      kit: KitCategory.TCR,
      pairedWt: false,
      filesProp: filesWithTypes,
    });

    expect(screen.getByText('immune.fastq')).toBeInTheDocument();
    expect(screen.queryByText('wt.fastq')).not.toBeInTheDocument();
  });
});
