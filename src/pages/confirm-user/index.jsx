import React, { useCallback, useState } from 'react';
import { Auth } from '@aws-amplify/auth';

const userMessages = {
  // CodeMismatchException: 'Invalid code provided, please try again.',
  expiredCode: 'This verification code has expired, it might be because your account is already confirmed. If not, please request a new code.',
  userAlreadyConfirmed: 'This user is already confirmed!',
  confirmedSuccessfully: 'Your account has been confirmed successfully! You can now log in.',
};

const confirmUserPage = () => {
  const [statusMessage, setStatusMessage] = useState('');

  const confirmSignup = useCallback(async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const username = searchParams.get('user_name');
    const code = searchParams.get('confirmation_code');

    try {
      await Auth.confirmSignUp(username, code);
      setStatusMessage(userMessages.confirmedSuccessfully);
    } catch (e) {
      console.error('errorDebug');
      console.error(e);

      if (e.code === 'ExpiredCodeException') {
        setStatusMessage(userMessages.expiredCode);
      }

      if (e.code === 'NotAuthorizedException' && e.message === 'User cannot be confirmed. Current status is CONFIRMED') {
        setStatusMessage(userMessages.userAlreadyConfirmed);
      }

      setStatusMessage(e.message);
    }
  });

  confirmSignup();

  return <div>{statusMessage}</div>;
};

export default confirmUserPage;
