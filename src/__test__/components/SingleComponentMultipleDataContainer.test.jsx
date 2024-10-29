/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SingleComponentMultipleDataContainer from 'components/SingleComponentMultipleDataContainer';

jest.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent, style }) => (
    <div style={style}>
      {data.map((item, index) => itemContent(index, item))}
    </div>
  ),
}));

describe('SingleComponentMultipleDataContainer', () => {
  const mockInputsList = [
    {
      key: 'panel1',
      headerName: 'Panel 1',
      params: { param1: 'value1' },
    },
    {
      key: 'panel2',
      headerName: 'Panel 2',
      params: { param2: 'value2' },
    },
  ];

  it('renders Empty component when inputsList is empty', () => {
    render(
      <SingleComponentMultipleDataContainer
        inputsList={[]}
        baseComponentRenderer={() => null}
      />,
    );
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders panels for each item in inputsList', () => {
    const mockRenderer = jest.fn(() => <div>Base Component</div>);
    render(
      <SingleComponentMultipleDataContainer
        inputsList={mockInputsList}
        baseComponentRenderer={mockRenderer}
      />,
    );

    // Check that panel headers are rendered
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.getByText('Panel 2')).toBeInTheDocument();

    // Check that baseComponentRenderer is called for each item
    expect(mockRenderer).toHaveBeenCalledTimes(4);

    // Check that 'Base Component' text is rendered
    expect(screen.getAllByText('Base Component')).toHaveLength(2);
  });

  it('toggles panel content when header is clicked', () => {
    const mockRenderer = jest.fn(() => <div>Base Component</div>);
    render(
      <SingleComponentMultipleDataContainer
        inputsList={mockInputsList}
        baseComponentRenderer={mockRenderer}
      />,
    );

    // Panel 1
    const panel1Header = screen.getByText('Panel 1');
    const panel1Content = screen.getAllByText('Base Component')[0];

    // By default, panel is open, content should be visible
    expect(panel1Content).toBeInTheDocument();
    expect(panel1Content.parentElement).toHaveStyle('max-height: 2000px');

    // Click to collapse
    fireEvent.click(panel1Header);

    // Now, content should be hidden
    expect(panel1Content.parentElement).toHaveStyle('max-height: 0px');

    // Click again to expand
    fireEvent.click(panel1Header);

    // Content should be visible again
    expect(panel1Content.parentElement).toHaveStyle('max-height: 2000px');
  });

  it('calls baseComponentRenderer with correct params', () => {
    const mockRenderer = jest.fn(() => <div>Base Component</div>);
    render(
      <SingleComponentMultipleDataContainer
        inputsList={mockInputsList}
        baseComponentRenderer={mockRenderer}
      />,
    );

    expect(mockRenderer).toHaveBeenCalledTimes(4);
    expect(mockRenderer).toHaveBeenNthCalledWith(1, { param1: 'value1' });
    expect(mockRenderer).toHaveBeenNthCalledWith(2, { param2: 'value2' });
  });
});
