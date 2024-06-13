import fetchAPI from 'utils/http/fetchAPI';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import handleError from 'utils/http/handleError';

const revokeRole = async (userEmail, projectInfo) => {
  const { id, name } = projectInfo;

  try {
    await fetchAPI(
      `/v2/access/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
        }),
      },
    );

    pushNotificationMessage('success', `${userEmail} removed from ${name}.`);
  } catch (e) {
    handleError(e, 'Error removing user.');
  }
};

export default revokeRole;
