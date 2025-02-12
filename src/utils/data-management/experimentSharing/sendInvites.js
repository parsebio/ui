import fetchAPI from 'utils/http/fetchAPI';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import handleError from 'utils/http/handleError';
import endUserMessages from 'utils/endUserMessages';

const sendInvites = async (addedUsers, projectInfo, silentError = false) => {
  const {
    id, name, role,
  } = projectInfo;

  const requests = addedUsers.map(async (user) => {
    try {
      await fetchAPI(
        `/v2/access/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // TODO nothing in the api v2 should use a reference to project,
            // so we'll need a ticket to fix this in this api endpoint
            projectUuid: id,
            role,
            userEmail: user,
          }),
        },
      );
      pushNotificationMessage('success', `User ${user} has been successfully invited to view ${name}.`);
    } catch (e) {
      if (!silentError) {
        const messageToDisplay = e?.userMessage === 'NotificationFailure'
          ? endUserMessages.SHARE_SUCESS_NOTIFICATION_FAILURE
          : endUserMessages.SHARE_FAILURE;

        handleError(e, messageToDisplay);
      }
    }
  });

  return Promise.all(requests);
};

export default sendInvites;
