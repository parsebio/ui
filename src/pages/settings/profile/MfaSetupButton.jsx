import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import {
  Button, Modal, Popconfirm, message,
} from 'antd';

import TotpSetup from 'pages/settings/profile/TotpSetup';
import { cognitoMFA } from 'const';

const MfaSetupButton = ({ user }) => {
  const [showTotpSetup, setShowTotpSetup] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(null);

  const loadMfaEnabled = async () => {
    const mfaType = await Auth.getPreferredMFA(user);
    setMfaEnabled(mfaType === cognitoMFA.enabled);
  };

  useEffect(() => {
    loadMfaEnabled();
  }, []);

  const changeMFAEnabled = useCallback(async (enabled) => {
    const mfaValue = enabled ? cognitoMFA.enabled : cognitoMFA.disabled;

    await Auth.setPreferredMFA(user, mfaValue);

    setMfaEnabled(enabled);
    setShowTotpSetup(false);
    message.success(`MFA is now ${enabled ? 'enabled' : 'disabled'}`);

    // Doing Auth.signOut() here and refreshing doesn't actually logout the user
    // There's some kind of bug with amplify 4.x that, if we don't do this workaround,
    // will cause the user to not be able to logout when they try to.
    // It's not only us:
    // - https://stackoverflow.com/questions/77920641/cannot-sign-out-after-setting-up-totp-mfa-in-cognito-using-amplify
    if (enabled) {
      await Auth.signOut();
      // eslint-disable-next-line no-self-assign
      window.location.reload();
    }
  }, [user]);

  return (
    <>
      {mfaEnabled ? (
        <Popconfirm
          title='Are you sure you want to disable MFA?'
          onConfirm={() => changeMFAEnabled(false)}
          okText='Yes'
          cancelText='No'
        >
          <Button>Disable MFA</Button>
        </Popconfirm>
      ) : (
        <Button type='primary' onClick={() => setShowTotpSetup(true)}>Enable MFA</Button>
      )}

      {showTotpSetup && (
        <Modal
          open
          width={600}
          onCancel={() => setShowTotpSetup(false)}
          footer={null}
        >
          <TotpSetup onTOTPSucceeded={() => changeMFAEnabled(true)} user={user} />
        </Modal>
      )}
    </>
  );
};

MfaSetupButton.defaultProps = {};

MfaSetupButton.propTypes = {
  user: PropTypes.object.isRequired,
};

export default MfaSetupButton;
