import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Auth } from '@aws-amplify/auth';

import {
  Input, Button, Typography, Space, Divider, Row,
  Tooltip,
} from 'antd';

import { totpQrcode } from '@aws-amplify/ui';
import QRCode from 'qrcode.react';
import { ClipLoader } from 'react-spinners';

const { Title, Text } = Typography;

const TotpSetup = (props) => {
  const { onTOTPSucceeded, user } = props;

  const [setupKey, setSetupKey] = useState(null);
  const [totpAuthCode, setTotpAuthCode] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadSetupKey();
  }, []);

  const verifyEnabled = useMemo(() => totpAuthCode && totpAuthCode.length === 6, [totpAuthCode]);

  const handleInputChange = (event) => {
    const { target: { value } } = event;

    setTotpAuthCode(value);
  };

  const loadSetupKey = async () => {
    const data = await Auth.setupTOTP(user);

    setSetupKey(data);
  };

  const verify = async () => {
    try {
      await Auth.verifyTotpToken(user, totpAuthCode);
      onTOTPSucceeded();
    } catch (error) {
      if (error.message === 'Code mismatch') {
        setErrorMessage('Invalid code, please check the six-digit code is correct and try again. If the problem persists, try setting up the account again.');
        return;
      }

      setErrorMessage('An unexpected error happened, please try again. If the problem persists, contact support.');
    }
  };

  const renderQrCode = () => {
    const issuer = encodeURI('Trailmaker');

    const otpauthUrl = `otpauth://totp/${issuer}:${user.attributes.email}?secret=${setupKey}&issuer=${issuer}`;

    return (
      <div className={totpQrcode}>
        <QRCode value={otpauthUrl} />
      </div>
    );
  };

  if (!setupKey) {
    return (
      <center>
        <ClipLoader
          size={50}
          color='#8f0b10'
        />
      </center>
    );
  }

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
        1. Set up the account in your
        {' '}
        <Tooltip title='There is a wide variety of authentication apps available. For example, Google Authenticator is a popular choice that you can download onto your phone'>
          <Text style={{ color: '#9966b8' }} color='#9966b8'>authenticator application</Text>
        </Tooltip>
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
