import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Vega } from 'react-vega';

import { initialPlotConfigStates } from 'redux/reducers/componentConfig/initialState';
import { generateSpec, generateData } from 'utils/plotSpecs/generateEmbeddingCategoricalSpec';
import getCellSets from 'redux/selectors/cellSets/getCellSets';

const mockStore = configureMockStore([thunk]);
const cellSets = getCellSets()({
  properties: {
    'cluster-a': {
      name: 'cluster a',
      key: 'cluster-a',
      cellIds: new Set([0, 1, 2, 3, 4, 5]),
      color: '#00FF00',
    },
    'cluster-b': {
      name: 'cluster b',
      key: 'cluster-b',
      cellIds: new Set([6, 7, 8, 9, 10]),
      color: '#FF0000',
    },
    'sample-a': {
      name: 'sample a',
      key: 'sample-a',
      cellIds: new Set([0, 2, 7, 8]),
      color: '#00FF00',
    },
    'sample-b': {
      name: 'sample b',
      key: 'sample-b',
      cellIds: new Set([1, 3, 4, 6, 7, 8, 5]),
      color: '#FF0000',
    },
    louvain: {
      name: 'Louvain clusters',
      key: 'louvain',
      type: 'cellSets',
      cellIds: new Set(),
      rootNode: true,
    },
    scratchpad: {
      name: 'Custom selections',
      key: 'scratchpad',
      type: 'cellSets',
      cellIds: new Set(),
      rootNode: true,
    },
    sample: {
      name: 'Samples',
      key: 'sample',
      type: 'metadataCategorical',
      cellIds: new Set(),
      rootNode: true,
    },
  },
  hierarchy: [
    {
      key: 'louvain',
      children: [{ key: 'cluster-a' }, { key: 'cluster-b' }],
    },
    {
      key: 'sample',
      children: [{ key: 'sample-a' }, { key: 'sample-b' }],
    },
    {
      key: 'scratchpad',
      children: [],
    },
  ],
});

const embeddingData = {
  xValues: [-1.2343500852584839, 18.337648391723633, 12.77301025390625, 12.23039436340332,
    11.743823051452637, 14.73792839050293, 18.160137176513672, -0.6337113976478577,
    -0.44386163353919983, 7.28579044342041, 14.973455429077148, 18],
  yValues: [-0.6240003705024719, -4.259221, 9.594305038452148, 8.78237533569336,
    14.542245864868164, -6.2992401123046875, -5.003548622131348, -4.029159069061279,
    -3.227933883666992, 13.526543617248535, 11.745992660522461, 10],
  cellIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};
const config = initialPlotConfigStates.embeddingCategorical;
const expression = [0.844880940781665, 0, 0, 0, 0, 0, 1, 2,
  1.0892605007475098, 0.9444651009182008, 0, 0, 0.9955310761799436, 0, 0];

const initialState = {
  cellSets,
  embeddings: {
    umap: {
      embeddingData,
    },
  },
  genes: {
    expression: {
      data: {
        CST3: {
          expression,
        },
      },
    },
  },
};
const store = mockStore(initialState);
let component;
const method = 'UMAP';
const {
  plotData,
  cellSetsPlotData,
} = generateData(cellSets, config.selectedSample, config.selectedCellSet, embeddingData);

const spec = generateSpec(config, method, plotData, cellSetsPlotData);

const testPlot = () => mount(
  <Provider store={store}>
    <Vega
      spec={spec}
      renderer='canvas'
    />
  </Provider>,
);

describe('Embedding categorical plot ', () => {
  afterEach(() => {
    component.unmount();
  });

  it('Embedding categorical loads', () => {
    component = testPlot();
    const vegaAvailable = component.find(Vega);
    expect(vegaAvailable.length).toEqual(1);
  });

  it('Embedding categorical loads filtered', () => {
    component = testPlot();
    config.selectedSample = 'sample-b';
    const vegaAvailable = component.find(Vega);
    expect(vegaAvailable.length).toEqual(1);
  });
});
