import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import Auth from '@aws-amplify/auth';
import {
  Form, Input, Button, Typography, Space, Divider, Row,
} from 'antd';

import { totpQrcode } from '@aws-amplify/ui';
import QRCode from 'qrcode.react';

const { Title, Text } = Typography;

const TotpSetup = (props) => {
  const { onTOTPSucceeded, user } = props;

  const [code, setCode] = useState(null);
  const [totpAuthCode, setTotpAuthCode] = useState(null);

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

    setCode(data);
  };

  const verify = async () => {
    await Auth.verifyTotpToken(user, totpAuthCode);

    onTOTPSucceeded();
  };

  const renderQrCode = () => {
    if (!code) return null;

    const issuer = encodeURI('AWSCognito');
    const otpauthUrl = `otpauth://totp/${issuer}:${user.username}?secret=${code}&issuer=${issuer}`;

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
        {renderQrCode(code)}
      </center>
    </Space>
  );

  const plainCodeSection = (
    <Space align='center' direction='vertical' style={{ height: '100%', width: '50%' }}>
      <Title style={{ fontSize: 15 }} level={5}>Or enter the setup key</Title>
      <Text style={{ top: '50%', bottom: '50%' }}>
        <pre>{code}</pre>
      </Text>
    </Space>
  );

  return (
    <Space direction='vertical'>
      <Divider orientation='left' orientationMargin='10px'>
        1. Set up the account in your authenticator application
      </Divider>
      <Row style={{ height: '100%' }} wrap={false}>
        {qrSection}
        <Divider orientation='center' type='vertical' style={{ width: '1px', height: '200px' }} />
        {plainCodeSection}
      </Row>

      <Divider orientation='left' orientationMargin='10px'>
        2. Verify
      </Divider>

      <Input onChange={handleInputChange} placeholder='Enter here the 6 digit code (token) your application shows' />

      <center>
        <Button type='primary' onClick={verify} disabled={!verifyEnabled} style={{ marginTop: '20px', width: '50%' }}>
          Verify Security Token
        </Button>
      </center>
    </Space>
  );
};

TotpSetup.defaultProps = {};

TotpSetup.propTypes = {
  onTOTPSucceeded: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default TotpSetup;
