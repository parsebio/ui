import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FastqFilesTable from 'components/secondary-analysis/FastqFilesTable';
import { deleteSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';

jest.mock('redux/actions/secondaryAnalyses/deleteSecondaryAnalysisFile', () => jest.fn(() => ({ type: 'MOCK_ACTION' })));

const mockStore = configureMockStore([thunk]);

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

const renderComponent = (store, canEditTable = true) => {
  render(
    <Provider store={store}>
      <FastqFilesTable files={files} canEditTable={canEditTable} secondaryAnalysisId='analysis1' />
    </Provider>,
  );
};

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
    renderComponent(store, false);

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

    render(
      <Provider store={store}>
        <FastqFilesTable files={expiredFiles} canEditTable secondaryAnalysisId='analysis1' />
      </Provider>,
    );

    fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[2]);

    expect(deleteSecondaryAnalysisFile).toHaveBeenCalledWith('analysis1', 'file3');
  });
});
