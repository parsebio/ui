import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Auth } from '@aws-amplify/auth';
import {
  Button, Modal, Popconfirm, message,
} from 'antd';

import TotpSetup from 'pages/settings/profile/TotpSetup';
import { cognitoMFA } from 'utils/constants';

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
    const mfaValue = enabled ? cognitoMFA.enabled : cognitoMFA.disabled;

    await Auth.setPreferredMFA(user, mfaValue);

    setMfaEnabled(enabled);
    setShowTotpSetup(false);
    message.success(`MFA is now ${enabled ? 'enabled' : 'disabled'}`);
  };

  const disableMfa = async () => {
    changeMFAEnabled(false);
  };

  return (
    <>
      {mfaEnabled ? (
        <Popconfirm
          title='Are you sure you want to disable MFA?'
          onConfirm={disableMfa}
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
