import '@testing-library/jest-dom';
import '__test__/test-utils/setupTests';

import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import React from 'react';
import FeedbackButton from 'components/sider/FeedbackButton';

describe('FeedbackButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders a button correctly without any props', () => {
    render(<FeedbackButton />);
    expect(screen.getByText(/Support/i)).toBeDefined();
  });

  it('Displays the help card when clicked', () => {
    render(<FeedbackButton collapsed={false} />);
    const button = screen.getByText(/Support/i);
    fireEvent.click(button);

    // Check if one of the help links is present
    expect(
      screen.getByText(/Our website/i),
    ).toBeInTheDocument();

    // Check that the email link is present
    expect(screen.getByRole('link', { name: /support@parsebiosciences.com/i })).toBeInTheDocument();
  });
});
