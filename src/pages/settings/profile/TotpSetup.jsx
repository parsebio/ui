import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import Auth from '@aws-amplify/auth';
import {
  Input, Button, Typography, Space, Divider, Row,
} from 'antd';

import { totpQrcode } from '@aws-amplify/ui';
import QRCode from 'qrcode.react';

const { Title, Text } = Typography;

const TotpSetup = (props) => {
  const { onTOTPSucceeded, user } = props;

  const [setupKey, setSetupKey] = useState(null);
  const [totpAuthCode, setTotpAuthCode] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    initialSetup();
  }, []);

  const verifyEnabled = useMemo(() => totpAuthCode && totpAuthCode.length === 6, [totpAuthCode]);

  const handleInputChange = (event) => {
    const { target: { value } } = event;

    setTotpAuthCode(value);
  };

  const initialSetup = async () => {
    const data = await Auth.setupTOTP(user);

    setSetupKey(data);
  };

  const verify = async () => {
    try {
      await Auth.verifyTotpToken(user, totpAuthCode);
      onTOTPSucceeded();
    } catch (error) {
      if (error.type === 'EnableSoftwareTokenMFAException'
        && error.message.includes('Code mismatch')
      ) {
        setErrorMessage('Invalid code, please try again');
      }

      setErrorMessage('An unexpected error happened, please try again.');
    }
  };

  const renderQrCode = () => {
    if (!setupKey) return null;

    const issuer = encodeURI('Trailmaker');

    const otpauthUrl = `otpauth://totp/${issuer}:${user.attributes.email}?secret=${setupKey}&issuer=${issuer}`;

    return (
      <div className={totpQrcode}>
        <QRCode value={otpauthUrl} />
      </div>
    );
  };

  const qrSection = (
    <Space align='center' direction='vertical' style={{ width: '50%' }}>
      <Title style={{ fontSize: 15 }} level={5}>Scan the qr code</Title>
      <center>
        {renderQrCode(setupKey)}
      </center>
    </Space>
  );

  const plainCodeSection = (
    <Space align='center' direction='vertical' style={{ height: '100%', width: '50%' }}>
      <Title style={{ fontSize: 15 }} level={5}>Or enter the setup key</Title>
      <Text style={{ top: '50%', bottom: '50%' }}>
        <pre>{setupKey}</pre>
      </Text>
    </Space>
  );

  return (
    <Space direction='vertical'>
      <Divider orientation='left' orientationMargin='10px'>
        1. Set up the account in your authenticator application
      </Divider>
      <Row style={{ height: '200px' }} wrap={false}>
        {qrSection}
        <Divider orientation='center' type='vertical' style={{ width: '1px', height: '100%' }} />
        {plainCodeSection}
      </Row>

      <Divider orientation='left' orientationMargin='10px'>
        2. Verify
      </Divider>

      <div>
        <Title style={{ fontSize: 14 }} level={5}>
          Enter the 6 digit code (token) your application shows
        </Title>
        <Input style={{ marginTop: '5px' }} onChange={handleInputChange} placeholder='Enter code here' />
      </div>

      <center>
        <Button type='primary' onClick={verify} disabled={!verifyEnabled} style={{ marginTop: '20px', width: '50%' }}>
          Verify Security Token
        </Button>
      </center>

      {errorMessage
        && (
          <Text type='danger'>{errorMessage}</Text>
        )}
    </Space>
  );
};

TotpSetup.defaultProps = {};

TotpSetup.propTypes = {
  onTOTPSucceeded: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default TotpSetup;
