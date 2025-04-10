import React from 'react';
import {
  screen, render, fireEvent, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { makeStore } from 'redux/store';

import { act } from 'react-dom/test-utils';
import fake from '__test__/test-utils/constants';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import mockAPI, {
} from '__test__/test-utils/mockAPI';
import sendInvites from 'utils/data-management/experimentSharing/sendInvites';

import ShareProjectModal from 'components/data-management/project/ShareProjectModal';
import { removeExperiment } from 'redux/actions/experiments';

jest.mock('@aws-amplify/auth', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn().mockImplementation(async () => ({
      username: 'mockuser',
      attributes: {
        email: 'mock@user.name',
        name: 'Mocked User',
      },
    })),
  },
}));

jest.mock('redux/actions/experiments', () => ({
  removeExperiment: jest.fn(() => ({ type: 'MOCK_ACTION' })),
}));

jest.mock('utils/data-management/experimentSharing/sendInvites', () => jest.fn(() => Promise.resolve([{
  data: { code: 200 },
},
{
  data: { code: 200 },
}])));
describe('Share project modal', () => {
  const onCancel = jest.fn();
  enableFetchMocks();

  const customAPIResponse = {
    [`/access/${fake.EXPERIMENT_ID}$`]: () => Promise.resolve(new Response(JSON.stringify([{
      name: 'Bob',
      email: 'bob@bob.com',
      role: 'explorer',
    },
    {
      name: 'Mocked User',
      email: 'mock@user.name',
      role: 'owner',
    }]))),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockIf(/.*/, mockAPI(customAPIResponse));
  });

  const renderShareExperimentModal = async () => {
    await act(async () => render(
      <Provider store={makeStore()}>
        <ShareProjectModal
          onCancel={onCancel}
          project={{
            id: fake.EXPERIMENT_ID,
            name: fake.EXPERIMENT_NAME,
          }}
          projectType='experiment'
        />
        ,
      </Provider>,
    ));
  };

  it('Renders correctly', async () => {
    await renderShareExperimentModal();
    expect(screen.getByText('Share with collaborators')).toBeInTheDocument();
    expect(screen.getByText(fake.EXPERIMENT_NAME)).toBeInTheDocument();
    expect(screen.getByText('Input an email address. Add multiple addresses with enter.')).toBeInTheDocument();
    expect(screen.getAllByRole('combobox').length).toEqual(2);
    expect(screen.getByText('bob@bob.com')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    const revokeButtons = screen.getAllByRole('button', { name: 'Revoke' });
    expect(revokeButtons.length).toEqual(2);

    // revoke button for the user viewing is disabled
    expect(revokeButtons[1]).toHaveAttribute('disabled');
  });

  it('Inviting users works', async () => {
    await renderShareExperimentModal();
    const input = screen.getAllByRole('combobox');
    userEvent.type(input[0], 'asd@asd.com{enter}');

    await waitFor(() => expect(screen.getByText('Add')).toBeInTheDocument());
    const inviteButton = screen.getByText('Add');
    await act(() => fireEvent.click(inviteButton));
    expect(fetchMock.mock.calls.length).toEqual(1);
    expect(fetchMock.mock.calls[1]).toMatchSnapshot();
  });

  it('Revoke access works', async () => {
    await renderShareExperimentModal();
    const revokeButton = screen.getAllByText('Revoke');
    expect(screen.getByText('bob@bob.com')).toBeInTheDocument();
    await act(() => userEvent.click(revokeButton[0]));
    await waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('Transferring ownership works', async () => {
    await renderShareExperimentModal();

    // Change role from 'explorer' to 'owner'
    const roleSelect = screen.getAllByRole('combobox')[1];
    userEvent.click(roleSelect);
    const ownerOption = await screen.findByText('Owner');
    userEvent.click(ownerOption);

    // Add a valid email for the new owner
    const emailSelect = screen.getAllByRole('combobox')[0];
    userEvent.type(emailSelect, 'newowner@owner.com{enter}');

    // The OK button now shows "Add" because an email has been added,
    // and since role is 'owner', it is wrapped inside a Popconfirm.
    const transferButton = screen.getByRole('button', { name: 'Add' });
    userEvent.click(transferButton);

    // Wait for the Popconfirm to render and confirm the action.
    const confirmButton = await screen.findByText('Yes');
    userEvent.click(confirmButton);

    await waitFor(() => {
      expect(removeExperiment).toHaveBeenCalledWith(fake.EXPERIMENT_ID);
      expect(sendInvites).toHaveBeenCalledWith(['newowner@owner.com'], { id: 'testae48e318dab9a1bd0bexperiment', name: 'Test Experiment', role: 'owner' });
    });
  });
});
