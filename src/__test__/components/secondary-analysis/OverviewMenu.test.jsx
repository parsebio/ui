import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OverviewMenu from 'components/secondary-analysis/OverviewMenu';

const wizardSteps = [
  {
    key: 'Step 1',
    isLoading: false,
    isValid: true,
    renderMainScreenDetails: jest.fn(() => <div>Details for Step 1</div>),
    getIsDisabled: jest.fn(() => false),
  },
  {
    key: 'Step 2',
    isLoading: false,
    isValid: false,
    renderMainScreenDetails: jest.fn(() => <div>Details for Step 2</div>),
    getIsDisabled: jest.fn(() => false),
  },
];

const setCurrentStep = jest.fn();

const renderComponent = (editable = true) => {
  render(
    <OverviewMenu
      wizardSteps={wizardSteps}
      setCurrentStep={setCurrentStep}
      editable={editable}
    />,
  );
};

describe('OverviewMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the OverviewMenu component correctly', () => {
    renderComponent();

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Details for Step 1')).toBeInTheDocument();
    expect(screen.getByText('Details for Step 2')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2);
  });

  it('displays the correct icons based on step validity', () => {
    renderComponent();

    expect(screen.getAllByRole('img', { name: /check-circle/i })).toHaveLength(1);
    expect(screen.getAllByRole('img', { name: /close-circle/i })).toHaveLength(1);
  });

  it('calls setCurrentStep when edit button is clicked', () => {
    renderComponent();

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(setCurrentStep).toHaveBeenCalledWith(3);
  });

  it('does not render edit buttons when editable is false', () => {
    renderComponent(false);

    expect(screen.queryAllByRole('button', { name: /edit/i })).toHaveLength(0);
  });
});
