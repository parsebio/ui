import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Auth from '@aws-amplify/auth';
import { Button, Modal, message } from 'antd';

import TotpSetup from 'pages/settings/profile/TotpSetup';

const MfaSetupButton = ({ user }) => {
  const [showTotpSetup, setShowTotpSetup] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(null);

  const loadMfaEnabled = async () => {
    const mfaType = await Auth.getPreferredMFA(user);
    setMfaEnabled(mfaType === 'SOFTWARE_TOKEN_MFA');
  };

  useEffect(() => {
    loadMfaEnabled();
  }, []);

  const changeMFAEnabled = async (enabled) => {
    const mfaValue = enabled ? 'TOTP' : 'NOMFA';

    await Auth.setPreferredMFA(user, mfaValue);

    setMfaEnabled(enabled);
    setShowTotpSetup(false);
    message.success(`MFA is now ${enabled ? 'enabled' : 'disabled'}`);
  };

  const disableMFA = async () => {
    await changeMFAEnabled(false);
  };

  return (
    <>
      {mfaEnabled ? (
        <Button onClick={disableMFA}>Disable MFA</Button>
      ) : (
        <Button onClick={() => setShowTotpSetup(true)}>Enable MFA</Button>
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
