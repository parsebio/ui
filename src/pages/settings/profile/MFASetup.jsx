import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Auth from '@aws-amplify/auth';
import { Button, Modal, message } from 'antd';

import TOTPSetup from 'pages/settings/profile/TOTPSetup';

const MFASetup = ({ user }) => {
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);

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

    message.success(`MFA is now: ${enabled ? 'enabled' : 'disabled'}`);
  };

  const disableMFA = async () => {
    await changeMFAEnabled(false);
  };

  return (
    <>
      {mfaEnabled ? (
        <Button onClick={disableMFA}>Disable MFA</Button>
      ) : (
        <Button onClick={() => setShowTOTPSetup(true)}>Enable MFA</Button>
      )}

      <Modal open={showTOTPSetup} width={600} onCancel={() => setShowTOTPSetup(false)}>
        <TOTPSetup onTOTPEvent={() => { }} user={user} />
      </Modal>
    </>
  );
};

MFASetup.defaultProps = {};

MFASetup.propTypes = {
  user: PropTypes.object.isRequired,
};

export default MFASetup;
