import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@aws-amplify/auth';
import fetchAPI from 'utils/http/fetchAPI';

import pushNotificationMessage from 'utils/pushNotificationMessage';
import endUserMessages from 'utils/endUserMessages';
import ReferralButton from 'components/sider/ReferralButton';
import '__test__/test-utils/setupTests';

jest.mock('utils/http/fetchAPI');

jest.mock('@aws-amplify/auth', () => ({
  currentAuthenticatedUser: jest.fn().mockImplementation(async () => ({
    username: 'mockuser',
    attributes: {
      email: 'mock@user.name',
      name: 'Mocked User',
    },
  })),
}));

describe('ReferralButton', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders a button correctly without any props', () => {
    render(<ReferralButton />);
    expect(screen.getByText(/Recommend/i)).toBeDefined();
  });

  it('Shows an input, a text area input and 2 buttons when opened', () => {
    render(<ReferralButton />);

    const referralButton = screen.getByText(/Recommend/i);
    userEvent.click(referralButton);

    // There's 2 buttons
    expect(screen.getByText(/cancel/i)).toBeDefined();
    expect(screen.getByText(/Send invite/i)).toBeDefined();
  });

  it('Submit button is disabled if email is invalid', async () => {
    render(<ReferralButton />);

    const invalidEmail = 'invalidEmail';

    const referralButton = screen.getByText(/Recommend/i);
    userEvent.click(referralButton);

    const emailInput = screen.getByPlaceholderText(/Your friend's email address/i);
    fireEvent.change(emailInput, { target: { value: invalidEmail } });

    await waitFor(() => expect(emailInput).toHaveValue(invalidEmail));

    const submitButton = screen.getByText(/Send invite/i).closest('button');

    expect(submitButton).toBeDisabled();
  });

  it('It sends a POST request containing the feedback', async () => {
    fetchAPI.mockImplementation(() => Promise.resolve(new Response('OK')));

    render(<ReferralButton />);

    const emailText = 'friend@email.com';
    const expectedFeedbackBody = {
      data: {
        channel: 'referrals',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: `To: ${emailText}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Message:\n Hi,\n\nCheck out Trailmaker. It will make your single-cell analysis easier.',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'context',
            elements: [],
          },
        ],
      },
    };

    const referralButton = screen.getByText(/Recommend/i);
    userEvent.click(referralButton);

    const emailInput = screen.getByPlaceholderText(/Your friend's email address/i);
    fireEvent.change(emailInput, { target: { value: emailText } });

    await waitFor(() => expect(emailInput).toHaveValue(emailText));

    const submitButton = screen.getByText(/Send invite/i).closest('button');

    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchAPI).toHaveBeenCalledTimes(1));

    const feedbackBody = fetchAPI.mock.calls[0][1].body;
    expect(feedbackBody).toEqual(JSON.stringify(expectedFeedbackBody));

    await waitFor(() => expect(pushNotificationMessage).toHaveBeenCalledTimes(1));
    const pushNotificationMessageParams = pushNotificationMessage.mock.calls[0];

    expect(pushNotificationMessageParams[0]).toEqual('success');
    expect(pushNotificationMessageParams[1]).toEqual(endUserMessages.REFERRAL_SUCCESSFUL);
  });

  it('It sends an error message on sending POST request fails', async () => {
    fetchAPI.mockImplementation(() => Promise.reject(new Error('Some error')));

    render(<ReferralButton />);

    const emailText = 'friend@email.com';

    const referralButton = screen.getByText(/Recommend/i);
    userEvent.click(referralButton);

    const emailInput = screen.getByPlaceholderText(/Your friend's email address/i);
    fireEvent.change(emailInput, { target: { value: emailText } });

    await waitFor(() => expect(emailInput).toHaveValue(emailText));

    const submitButton = screen.getByText(/Send invite/i).closest('button');

    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchAPI).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(pushNotificationMessage).toHaveBeenCalledTimes(1));
    const pushNotificationMessageParams = pushNotificationMessage.mock.calls[0];
    expect(pushNotificationMessageParams[0]).toEqual('error');
    expect(pushNotificationMessageParams[1]).toEqual(endUserMessages.REFERRAL_ERROR);
  });
});
