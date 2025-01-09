import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mockCellSets } from '__test__/test-utils/cellSets.mock';
import { analysisTools, downsamplingMethods } from 'utils/constants';
import _ from 'lodash';
import { initialPlotConfigStates } from 'redux/reducers/componentConfig/initialState';
import { initialEmbeddingState } from 'redux/reducers/embeddings/initialState';
import { generateDataProcessingPlotUuid } from 'utils/generateCustomPlotUuid';

import generateExperimentSettingsMock from '__test__/test-utils/experimentSettings.mock';
import '__test__/test-utils/setupTests';

import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalculationConfig from 'components/data-processing/DataIntegration/CalculationConfig';
import fake from '__test__/test-utils/constants';
import { EXPERIMENT_SETTINGS_NON_SAMPLE_FILTER_UPDATE } from 'redux/actionTypes/experimentSettings';

jest.mock('redux/selectors');

const dataIntegrationEmbeddingConfig = initialPlotConfigStates.dataIntegrationEmbedding;
const dataIntegrationFrequencyConfig = initialPlotConfigStates.dataIntegrationFrequency;
const dataIntegrationElbowConfig = initialPlotConfigStates.dataIntegrationElbow;

const filterName = 'dataIntegration';
const configureEmbeddingFilterName = 'configureEmbedding';

const mockStore = configureStore([thunk]);

const initialExperimentState = generateExperimentSettingsMock([]);

const PCObject = () => ({ PC: 1, percent: 0.02, percentVariance: 0.02 });

const initialState = {
  embeddings: {
    ...initialEmbeddingState,
    umap: {
      data: [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
        [9, 10],
        [11, 12],
      ],
      loading: false,
      error: false,
    },
  },
  cellSets: mockCellSets,
  experimentSettings: {
    ...initialExperimentState,
  },
  componentConfig: {
    [generateDataProcessingPlotUuid(null, filterName, 1)]: {
      config: dataIntegrationElbowConfig,
      plotData: Array(50).fill(PCObject()),
    },
    dataIntegrationFrequency: {
      config: dataIntegrationFrequencyConfig,
      plotData: [],
    },
    [generateDataProcessingPlotUuid(null, configureEmbeddingFilterName, 1)]: {
      config: dataIntegrationEmbeddingConfig,
      plotData: [],
    },
  },

};

const explanationText = 'SeuratV4 is a computationally expensive method. It is highly likely that the integration will fail as it requires more resources than are currently available. We recommended you to evaluate other methods before using SeuratV4.';

describe('DataIntegration.CalculationConfig', () => {
  let mockedStore;

  const renderCalculationConfig = async (storeState) => {
    mockedStore = mockStore(storeState);
    return await render(
      <Provider store={mockedStore}>
        <CalculationConfig
          experimentId={fake.EXPERIMENT_ID}
          changedFilters={{ current: new Set() }}
          onConfigChange={jest.fn()}
        />
      </Provider>,
    );
  };

  it('renders correctly when data is in the store', async () => {
    await renderCalculationConfig(initialState);

    expect(screen.getByText('Data Integration')).toBeDefined();
    expect(screen.getByText('Downsampling Options')).toBeDefined();
  });

  it('renders correctly when nothing is loaded', async () => {
    const state = {
      embeddings: {},
      experimentSettings: {
        ...initialExperimentState,
      },
      componentConfig: {
        [generateDataProcessingPlotUuid(null, filterName, 1)]: {
          config: {},
          plotData: [],
        },
      },
    };

    await renderCalculationConfig(state);
  });

  it('downsampling options disabled by default', async () => {
    await renderCalculationConfig(initialState);

    userEvent.click(screen.getByText('Downsampling Options'));
    expect(screen.getByText('No Downsampling')).toBeDefined();
    const inputPercToKeep = screen.getByLabelText('% of cells to keep');
    expect(inputPercToKeep).toBeDisabled();
  });

  it('downsampling displays geosketch values correctly', async () => {
    const stateWithDownsampling = initialState;
    stateWithDownsampling.experimentSettings.processing.dataIntegration.downsampling = {
      method: downsamplingMethods.GEOSKETCH,
      methodSettings: {
        [downsamplingMethods.GEOSKETCH]: {
          percentageToKeep: 12,
        },
      },
    };

    renderCalculationConfig(stateWithDownsampling);

    userEvent.click(screen.getByText('Downsampling Options'));

    expect(screen.getByText('Geometric Sketching')).toBeDefined();
    const input = screen.getByLabelText('% of cells to keep');
    expect(input.value).toEqual('12');

    userEvent.type(input, '{backspace}{backspace}3');
    expect(input.value).toEqual('3');
  });

  it('displays the correct proportion of variation explained value', async () => {
    await renderCalculationConfig(initialState);
    expect(screen.getByDisplayValue('60')).toBeDefined();

    const input = screen.getByLabelText('Number of Principal Components');

    userEvent.type(input, '{backspace}{backspace}10');
    expect(input.value).toEqual('10');
  });

  it('Does not display alert if SeuratV4 is not chosen as the ', async () => {
    await renderCalculationConfig(initialState);

    // Initially harmony is chosen
    expect(screen.queryByText(explanationText)).toBeNull();
  });

  it('Displays an alert if SeuratV4 is chosen', async () => {
    const seuratV4State = _.merge(initialState, {
      experimentSettings: {
        processing: {
          dataIntegration: {
            dataIntegration: {
              method: 'seuratv4',
            },
          },
        },
      },
    });

    await renderCalculationConfig(seuratV4State);

    expect(screen.getByText(explanationText)).toBeInTheDocument();
  });

  it('Works for analysis tool scanpy', async () => {
    const scanpyState = _.merge(initialState, {
      experimentSettings: {
        processing: {
          dataIntegration: {
            analysisTool: analysisTools.SCANPY,
          },
        },
      },
    });

    await renderCalculationConfig(scanpyState);

    expect(screen.getByText('Data Integration')).toBeDefined();
    expect(screen.getByText('Downsampling Options')).toBeDefined();

    // Displays things correctly
    userEvent.click(screen.getByText('Downsampling Options'));

    expect(screen.getByText('Geometric Sketching')).toBeDefined();
    const input = screen.getByLabelText('% of cells to keep');
    expect(input.value).toEqual('12');

    userEvent.type(input, '{backspace}{backspace}3');
    expect(input.value).toEqual('3');
  });

  it('Switch dispatches action', async () => {
    const seuratV4State = _.merge(initialState, {
      experimentSettings: {
        processing: {
          dataIntegration: {
            analysisTool: analysisTools.SEURAT,
            dataIntegration: {
              method: 'seuratv4',
            },
          },
        },
      },
    });

    await renderCalculationConfig(seuratV4State);

    // Seurat v4 is selected
    expect(screen.queryByText('Harmony')).not.toBeInTheDocument();
    expect(screen.getByText('Seurat v4')).toBeInTheDocument();

    const scanpyRadioButton = screen.getByRole('radio', { name: /Scanpy/i });
    userEvent.click(scanpyRadioButton);

    expect(mockedStore.getActions()).toHaveLength(1);
    const action = mockedStore.getActions()[0];

    expect(action).toEqual({
      payload: expect.objectContaining({
        configChange: { analysisTool: analysisTools.SCANPY },
        step: 'dataIntegration',
      }),
      type: EXPERIMENT_SETTINGS_NON_SAMPLE_FILTER_UPDATE,
    });
  });
});
