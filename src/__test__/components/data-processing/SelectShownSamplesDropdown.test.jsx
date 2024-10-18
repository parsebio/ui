import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getMetadataToSampleIds } from 'redux/selectors';
import SelectShownSamplesDropdown from 'components/data-processing/SelectShownSamplesDropdown';

jest.mock('redux/selectors', () => ({
  getMetadataToSampleIds: jest.fn(),
}));

jest.mock('utils/pushNotificationMessage', () => jest.fn());

describe('SelectShownSamplesDropdown', () => {
  const samples = {
    sample1: { name: 'Sample 1' },
    sample2: { name: 'Sample 2' },
  };

  const metadataInfo = {
    metadata1: { tracka: ['sample1'], trackb: ['sample2'] },
  };

  beforeEach(() => {
    getMetadataToSampleIds.mockReturnValue(() => metadataInfo);
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <SelectShownSamplesDropdown
        shownSamples={[]}
        setShownSamples={jest.fn()}
        samples={samples}
      />,
    );
    expect(getByText('Select samples')).toBeInTheDocument();
  });

  it('updates shownSamples and shownMetadata on selection change', () => {
    const setShownSamples = jest.fn();
    const { getByText, getByTitle } = render(
      <SelectShownSamplesDropdown
        shownSamples={[]}
        setShownSamples={setShownSamples}
        samples={samples}
      />,
    );

    const treeSelect = getByText('Select samples');
    fireEvent.mouseDown(treeSelect);

    const sampleOption = getByTitle('Sample 1');
    fireEvent.click(sampleOption);

    expect(setShownSamples).toHaveBeenCalledWith(['sample1']);
  });

  it('selecting metadata track, selects its corresponding samples', () => {
    const setShownSamples = jest.fn();
    const { getByText, getByTitle } = render(
      <SelectShownSamplesDropdown
        shownSamples={[]}
        setShownSamples={setShownSamples}
        samples={samples}
      />,
    );

    const treeSelect = getByText('Select samples');
    fireEvent.mouseDown(treeSelect);

    const metadataOption = getByTitle('tracka');
    fireEvent.click(metadataOption);

    expect(setShownSamples).toHaveBeenCalledWith(['sample1']);
  });
});
