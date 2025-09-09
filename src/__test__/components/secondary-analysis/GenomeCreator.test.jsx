/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { makeStore } from 'redux/store';
import { mockAnalysisIds } from '__test__/data/secondaryAnalyses/secondary_analyses';

import loadGenomes from 'redux/actions/genomes/loadGenomes';
import mockAPI, {
  generateDefaultMockAPIResponses,
  promiseResponse,
} from '__test__/test-utils/mockAPI';

import GenomeCreator from 'components/secondary-analysis/GenomeCreator';
import { createGenome, createAndUploadGenomeFile } from 'redux/actions/genomes';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'pair-uuid-123'),
}));

jest.mock('redux/actions/genomes', () => ({
  createGenome: jest.fn(() => async () => 'new-genome-id'),
  createAndUploadGenomeFile: jest.fn(() => async () => ({ ok: true })),
}));

jest.mock('components/secondary-analysis/FilesUploadTable', () => ({ files }) => (
  <div data-testid='files-upload-table'>
    FilesUploadTable (
    {files.length}
    )
  </div>
));

jest.mock('components/ExpandableList', () => ({
  __esModule: true,
  default: ({
    expandedTitle,
    dataSource,
    getItemText,
    getItemExplanation,
    collapsedExplanation,
  }) => (
    <div data-testid='expandable-list'>
      <div>{expandedTitle}</div>
      <div data-testid='expandable-collapsed'>{collapsedExplanation}</div>
      <div>
        {dataSource.map((item, i) => (
          <div key={i} data-testid='invalid-item'>
            <span data-testid='invalid-item-name'>{getItemText(item)}</span>
            <span data-testid='invalid-item-reason'>{getItemExplanation(item)}</span>
          </div>
        ))}
      </div>
    </div>
  ),
}));

enableFetchMocks();

const makeFile = (name, content = 'x') => new File([content], name, { type: 'application/octet-stream' });

const renderWithStore = (store, props = {}) => render(
  <Provider store={store}>
    <GenomeCreator
      updateGenome={jest.fn()}
      secondaryAnalysisId={mockAnalysisIds.readyToLaunch}
      onGenomeDetailsChanged={jest.fn()}
      {...props}
    />
  </Provider>,
);

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('GenomeCreator (integration style with store + API mocks)', () => {
  let store;
  const projectId = 'proj-for-genomes';
  const baseApi = generateDefaultMockAPIResponses(projectId);

  beforeEach(async () => {
    jest.clearAllMocks();

    fetchMock.resetMocks();
    fetchMock.doMock();

    fetchMock.mockIf(/.*/, mockAPI(baseApi));

    store = makeStore();

    await store.dispatch(loadGenomes());
  });

  const typeValidNameAndDescription = () => {
    fireEvent.change(screen.getByPlaceholderText('Specify genome name'), {
      target: { value: 'My_Genome-1.0' },
    });
    fireEvent.change(screen.getByPlaceholderText('Specify genome description'), {
      target: { value: 'Something descriptive' },
    });
  };

  const dropFiles = async (files) => {
    const input = document.querySelector('input[type="file"]');
    await act(async () => {
      fireEvent.change(input, { target: { files } });
    });
  };

  it('renders inputs, dropzone, and disabled Upload initially', () => {
    renderWithStore(store);

    expect(screen.getByPlaceholderText('Specify genome name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Specify genome description')).toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();

    const uploadBtn = screen.getByRole('button', { name: 'Upload' });
    expect(uploadBtn).toBeDisabled();

    expect(
      screen.getByText(/Drag and drop one pair \(one FASTA \+ one annotation\) here/i),
    ).toBeInTheDocument();
  });

  it('rejects unknown file types and shows reason', async () => {
    renderWithStore(store);

    await dropFiles([makeFile('notes.txt')]);

    expect(screen.getByTestId('expandable-list')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-collapsed')).toHaveTextContent(/1 file was ignored/i);

    const name = screen.getByTestId('invalid-item-name');
    const reason = screen.getByTestId('invalid-item-reason');
    expect(name).toHaveTextContent('notes.txt');
    expect(reason).toHaveTextContent('Unsupported file type');
  });

  it('new genome upload flow: calls createGenome, uploads two files (same pair id), clears state, calls updateGenome', async () => {
    const updateGenome = jest.fn();
    renderWithStore(store, { updateGenome });

    typeValidNameAndDescription();

    await dropFiles([makeFile('my.fa'), makeFile('my.gtf')]);

    const uploadBtn = screen.getByRole('button', { name: 'Upload' });
    expect(uploadBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    expect(createGenome).toHaveBeenCalledTimes(1);
    expect(createGenome).toHaveBeenCalledWith(
      'My_Genome-1.0',
      'Something descriptive',
      mockAnalysisIds.readyToLaunch,
    );

    expect(updateGenome).toHaveBeenCalledTimes(1);
    expect(updateGenome).toHaveBeenCalledWith('new-genome-id');

    expect(createAndUploadGenomeFile).toHaveBeenCalledTimes(2);
    const [c1, c2] = createAndUploadGenomeFile.mock.calls;

    expect(c1[0]).toBe('new-genome-id');
    expect(c1[1].name).toBe('my.fa');
    expect(c1[2]).toBe('fasta');
    expect(c1[3]).toBe('pair-uuid-123');

    expect(c2[0]).toBe('new-genome-id');
    expect(c2[1].name).toBe('my.gtf');
    expect(c2[2]).toBe('annotation');
    expect(c2[3]).toBe('pair-uuid-123');

    expect(screen.queryByText('Pairs to be uploaded')).not.toBeInTheDocument();
    expect(screen.queryByTestId('expandable-list')).not.toBeInTheDocument();
  });

  it('existing genome upload flow: no createGenome, uses existing id, shows FilesUploadTable', async () => {
    const customGenomesPayload = {
      reference: [],
      custom: [
        {
          id: 'existing-1',
          name: 'Existing_Genome',
          description: 'Already there',
          built: false,
          files: {
            x1: { id: 'x1', name: 'prev.fa', uploadStatus: 'SUCCEEDED' },
          },
        },
      ],
    };

    fetchMock.mockIf(
      /.*/,
      mockAPI({
        ...baseApi,
        '/v2/genome$': () => promiseResponse(JSON.stringify(customGenomesPayload)),
      }),
    );

    store = makeStore();
    await store.dispatch(loadGenomes());

    const updateGenome = jest.fn();
    renderWithStore(store, { genomeId: 'existing-1', updateGenome });

    expect(screen.getByPlaceholderText('Specify genome name')).toHaveValue('Existing_Genome');
    expect(screen.getByPlaceholderText('Specify genome description')).toHaveValue('Already there');

    expect(screen.getByTestId('files-upload-table')).toHaveTextContent('FilesUploadTable (1)');

    await dropFiles([makeFile('ex.fa'), makeFile('ex.gtf')]);

    const uploadBtn = screen.getByRole('button', { name: 'Upload' });
    expect(uploadBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(uploadBtn);
    });

    expect(createGenome).not.toHaveBeenCalled();
    expect(updateGenome).not.toHaveBeenCalled();

    expect(createAndUploadGenomeFile).toHaveBeenCalledTimes(2);
    const [u1, u2] = createAndUploadGenomeFile.mock.calls;
    expect(u1[0]).toBe('existing-1');
    expect(u2[0]).toBe('existing-1');
    expect(u1[1].name).toBe('ex.fa');
    expect(u2[1].name).toBe('ex.gtf');
    expect(u1[2]).toBe('fasta');
    expect(u2[2]).toBe('annotation');
    expect(u1[3]).toBe('pair-uuid-123');
    expect(u2[3]).toBe('pair-uuid-123');
  });

  it('built=true genome clears inputs (no prefill)', async () => {
    const builtGenomesPayload = {
      reference: [],
      custom: [
        {
          id: 'built-1',
          name: 'ShouldNotPersist',
          description: 'AlsoShouldNotPersist',
          built: true,
          files: {},
        },
      ],
    };

    fetchMock.mockIf(
      /.*/,
      mockAPI({
        ...baseApi,
        '/v2/genome$': () => promiseResponse(JSON.stringify(builtGenomesPayload)),
      }),
    );

    store = makeStore();
    await store.dispatch(loadGenomes());

    renderWithStore(store, { genomeId: 'built-1' });

    expect(screen.getByPlaceholderText('Specify genome name')).toHaveValue('');
    expect(screen.getByPlaceholderText('Specify genome description')).toHaveValue('');
  });

  it('missing-pair drop adds composite FASTA+annotation reason (no duplicate reasons)', async () => {
    renderWithStore(store);

    await dropFiles([makeFile('lone.fa')]);

    const names = screen.getAllByTestId('invalid-item-name').map((n) => n.textContent);
    const reasons = screen.getAllByTestId('invalid-item-reason').map((n) => n.textContent);

    expect(names).toContain('lone.fa');
    expect(
      reasons.some((r) => /Need one FASTA.*and one annotation.*file\./i.test(r)),
    ).toBe(true);
  });

  it('dropping a duplicate file name flags duplicate (not the composite missing-pair reason)', async () => {
    renderWithStore(store);

    await dropFiles([makeFile('dup.fa'), makeFile('dup.gtf')]);
    await dropFiles([makeFile('dup.fa')]);

    const reasons = screen.getAllByTestId('invalid-item-reason').map((n) => n.textContent);

    expect(reasons.some((r) => /Duplicate of a selected file/i.test(r))).toBe(true);
    expect(reasons.some((r) => /Need one FASTA.*and one annotation/i.test(r))).toBe(false);
  });
});
