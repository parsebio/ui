import React, { useCallback, useEffect, useState } from 'react';
import { Auth } from '@aws-amplify/auth';

const userMessages = {
  expiredCode: 'This verification code has expired, it might be because your account is already confirmed. If not, please request a new code.',
  userAlreadyConfirmed: 'This account is already confirmed!',
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
      console.error(e);

      if (e.code === 'ExpiredCodeException') {
        setStatusMessage(userMessages.expiredCode);
        return;
      }

      if (e.code === 'NotAuthorizedException' && e.message === 'User cannot be confirmed. Current status is CONFIRMED') {
        setStatusMessage(userMessages.userAlreadyConfirmed);
        return;
      }

      setStatusMessage(e.message);
    }
  });

  useEffect(() => {
    confirmSignup();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'rgba(144, 144, 144, 1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '20%',
        height: '120px',
        marginTop: '-20%',
      }}
      >
        <div style={{ width: '100%' }}>
          <div style={{
            textAlign: 'center',
            background: 'rgba(79, 0, 131, 1)', // purple
            height: '87px',
            alignSelf: 'flex-start',
          }}
          >
            <svg xmlns='http://www.w3.org/2000/svg' width={200} height={70}>
              <defs id='svg_document_defs'>
                <style id='M Plus 2_Google_Webfont_import'>@import url(https://fonts.googleapis.com/css2?family=M+PLUS+2:wght@100..900&display=swap);</style>
              </defs>
              <g transform='translate(20, 25)'>
                {/* provided by? TBD */}
                <image href='/Parse_icon_white.png' x='0' y='0' width='40' height='40' />
                <text
                  style={{ outlineStyle: 'none' }}
                  fontWeight='900'
                  textRendering='geometricPrecision'
                  fontFamily='M Plus 2'
                  fill='#F0F2F5'
                  fontSize='22.00px'
                  textAnchor='start'
                  dominantBaseline='middle'
                  x='45'
                  y='22'
                >
                  Trailmaker
                </text>
              </g>
            </svg>
          </div>
          <div
            style={{
              height: '80px',
              background: 'rgba(255, 255, 255, 1)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '20px',
            }}
          >
            {statusMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default confirmUserPage;
