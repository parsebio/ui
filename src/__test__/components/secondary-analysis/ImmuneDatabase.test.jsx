import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ImmuneDatabase from 'components/secondary-analysis/ImmuneDatabase';
import KitCategory from 'const/enums/KitCategory';

describe('ImmuneDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the select and displays correct options for TCR', () => {
    const mockOnDetailsChanged = jest.fn();
    const { getByText, container } = render(
      <ImmuneDatabase
        database={null}
        kitCategory={KitCategory.TCR}
        onDetailsChanged={mockOnDetailsChanged}
      />,
    );

    expect(getByText('Select the database:')).toBeInTheDocument();
    const placeholder = container.querySelector('.ant-select-selection-placeholder');
    expect(placeholder).toBeInTheDocument();

    fireEvent.mouseDown(placeholder);
    expect(getByText('Human')).toBeInTheDocument();
    expect(getByText('Mouse')).toBeInTheDocument();
  });

  it('renders the select and displays correct options for BCR', () => {
    const mockOnDetailsChanged = jest.fn();
    const { getByText, container } = render(
      <ImmuneDatabase
        database={null}
        kitCategory={KitCategory.BCR}
        onDetailsChanged={mockOnDetailsChanged}
      />,
    );

    const placeholder = container.querySelector('.ant-select-selection-placeholder');

    fireEvent.mouseDown(placeholder);
    expect(getByText('Human')).toBeInTheDocument();
    expect(getByText('Mouse')).toBeInTheDocument();
    expect(getByText('Transgenic mouse')).toBeInTheDocument();
  });

  it('calls onDetailsChanged when selection changes', () => {
    const mockOnDetailsChanged = jest.fn();
    const { getByText, container } = render(
      <ImmuneDatabase
        database={null}
        kitCategory={KitCategory.TCR}
        onDetailsChanged={mockOnDetailsChanged}
      />,
    );

    const placeholder = container.querySelector('.ant-select-selection-placeholder');
    fireEvent.mouseDown(placeholder);
    fireEvent.click(getByText('Mouse'));
    expect(mockOnDetailsChanged).toHaveBeenCalledWith({ immuneDatabase: 'mouse' });
  });
});
