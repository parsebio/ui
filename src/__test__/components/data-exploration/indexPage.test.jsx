import DataExploration from 'pages/experiments/[experimentId]/data-exploration/index';
import { Provider } from 'react-redux';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import mockAPI, {
  generateDefaultMockAPIResponses,
} from '__test__/test-utils/mockAPI';
import { makeStore } from 'redux/store';
import { loadBackendStatus } from 'redux/actions/backendStatus';
import fake from '__test__/test-utils/constants';
import { updateFilterSettings, loadProcessingSettings } from 'redux/actions/experimentSettings';

import createTestComponentFactory from '__test__/test-utils/testComponentFactory';
import { GENES_PROPERTIES_LOADED_PAGINATED } from 'redux/actionTypes/genes';

describe('Data exploration index page', () => {
  let storeState = null;
  const experimentId = fake.EXPERIMENT_ID;

  const defaultResponses = generateDefaultMockAPIResponses(experimentId);
  beforeEach(async () => {
    enableFetchMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(/.*/, mockAPI(defaultResponses));

    storeState = makeStore();

    // Set up state for backend status
    await storeState.dispatch(loadBackendStatus(experimentId));
  });

  const dataExplorationFactory = createTestComponentFactory(DataExploration, { experimentId, route: '/some/route/lol.com', experimentData: {} });

  const renderExplorationPage = async () => {
    await render(
      <Provider store={storeState}>
        {dataExplorationFactory()}
      </Provider>,
    );
  };

  it('Renders all the mosaic windows', async () => {
    await renderExplorationPage();

    expect(screen.getAllByText('UMAP')[0]).toHaveClass('mosaic-window-title');
    expect(screen.getAllByText('Cell sets and Metadata')[0]).toHaveClass('mosaic-window-title');
    expect(screen.getAllByText('Genes')[0]).toHaveClass('mosaic-window-title');
    expect(screen.getAllByText('Heatmap')[0]).toHaveClass('mosaic-window-title');
  });

  it('Changing method changes the embedding window title', async () => {
    await storeState.dispatch(updateFilterSettings('configureEmbedding', { embeddingSettings: { method: 'newmethod' } }));
    await renderExplorationPage();
    expect(screen.getAllByText('NEWMETHOD')[0]).toHaveClass('mosaic-window-title');
  });

  const generateGeneData = (numGenes) => {
    const geneData = {};
    for (let i = 1; i <= numGenes; i += 1) {
      geneData[`gene${i}`] = { dispersions: numGenes - i };
    }
    return geneData;
  };

  it('Loads gene expression correctly for Seurat', async () => {
    const geneData = generateGeneData(50);

    await storeState.dispatch({
      type: GENES_PROPERTIES_LOADED_PAGINATED,
      payload: { data: geneData },
    });

    await storeState.dispatch(loadProcessingSettings(experimentId));

    await storeState.dispatch(updateFilterSettings('dataIntegration', { analysisTool: 'seurat' }));
    await renderExplorationPage();

    const geneExpressionCall = fetchMock.mock.calls[2];

    expect(geneExpressionCall).toBeDefined();
    const genesRequested = JSON.parse(geneExpressionCall[1].body).body.genes;

    expect(genesRequested.length).toBe(50);

    expect(genesRequested).toEqual(Array.from({ length: 50 }, (_, i) => `gene${i + 1}`));
  });

  it('Loads gene expression correctly for Scanpy', async () => {
    const geneData = generateGeneData(50);

    await storeState.dispatch({
      type: GENES_PROPERTIES_LOADED_PAGINATED,
      payload: { data: geneData },
    });

    await storeState.dispatch(loadProcessingSettings(experimentId));

    await storeState.dispatch(updateFilterSettings('dataIntegration', { analysisTool: 'scanpy' }));
    await renderExplorationPage();

    const geneExpressionCall = fetchMock.mock.calls[2];

    expect(geneExpressionCall).toBeDefined();
    const genesRequested = JSON.parse(geneExpressionCall[1].body).body.genes;
    expect(genesRequested.length).toBe(1);
    expect(genesRequested).toEqual(['gene1']);
  });
});
