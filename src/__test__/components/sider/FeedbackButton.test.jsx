import '@testing-library/jest-dom';
import '__test__/test-utils/setupTests';

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import fetchAPI from 'utils/http/fetchAPI';

import React from 'react';
import endUserMessages from 'utils/endUserMessages';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import FeedbackButton from 'components/sider/FeedbackButton';

jest.mock('utils/http/fetchAPI');

jest.mock('', () => ({
  currentAuthenticatedUser: jest.fn().mockImplementation(async () => true),
  federatedSignIn: jest.fn(),
}));

jest.mock('@aws-amplify/auth', () => ({
  currentAuthenticatedUser: jest.fn().mockImplementation(async () => ({
    username: 'mockuser',
    attributes: {
      email: 'mock@user.name',
      name: 'Mocked User',
    },
  })),
}));

const placeHolderTextRegex = /Please write your message here to provide feedback or report issues on Trailmaker. A member of our team will get back to you as soon as possible./i;

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

  it('It sends a POST request containing the feedback', async () => {
    fetchAPI.mockImplementation(() => Promise.resolve(new Response('OK')));

    render(<FeedbackButton />);

    const feedbackText = 'Some feedback';

    const feedbackButton = screen.getByText(/Support/i);
    fireEvent.click(feedbackButton);

    const feedbackInput = screen.getByPlaceholderText(placeHolderTextRegex);

    fireEvent.change(feedbackInput, { target: { value: feedbackText } });
    expect(feedbackInput).toHaveValue(feedbackText);

    const submitButton = screen.getByText(/Send/i).closest('button');

    // test cancel by closing and opening again
    const cancelButton = screen.getByText(/Cancel/i).closest('button');
    fireEvent.click(cancelButton);
    fireEvent.click(feedbackButton);
    expect(feedbackInput).toHaveValue(feedbackText);

    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchAPI).toHaveBeenCalledTimes(1));

    const feedbackBody = fetchAPI.mock.calls[0][1].body;
    expect(feedbackBody).toMatch(feedbackText);

    await waitFor(() => expect(pushNotificationMessage).toHaveBeenCalledTimes(1));

    const pushNotificationMessageParams = pushNotificationMessage.mock.calls[0];

    expect(pushNotificationMessageParams[0]).toEqual('success');
    expect(pushNotificationMessageParams[1]).toEqual(endUserMessages.FEEDBACK_SUCCESSFUL);

    expect(feedbackInput).toHaveValue('');
  });

  it('It sends an error message on sending POST request fails', async () => {
    fetchAPI.mockImplementation(() => Promise.reject(new Error('Some error')));

    render(<FeedbackButton />);

    const feedbackText = 'Some feedback';

    const feedbackButton = screen.getByText(/Support/i);
    fireEvent.click(feedbackButton);

    const feedbackInput = screen.getByPlaceholderText(placeHolderTextRegex);

    fireEvent.change(feedbackInput, { target: { value: feedbackText } });
    expect(feedbackInput).toHaveValue(feedbackText);

    const submitButton = screen.getByText(/Send/i).closest('button');

    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchAPI).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(pushNotificationMessage).toHaveBeenCalledTimes(1));
    const pushNotificationMessageParams = pushNotificationMessage.mock.calls[0];
    expect(pushNotificationMessageParams[0]).toEqual('error');
    expect(pushNotificationMessageParams[1]).toEqual(endUserMessages.FEEDBACK_ERROR);

    expect(feedbackInput).toHaveValue(feedbackText);
  });
});
