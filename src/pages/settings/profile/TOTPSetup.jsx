import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { I18n } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import {
  Form, Input, Button, Typography, message,
  Space,
  Divider,
  Row,
} from 'antd';

import { totpQrcode } from '@aws-amplify/ui';
import QRCode from 'qrcode.react';

const { Title, Text } = Typography;

const TOTPSetup = (props) => {
  const { onTOTPEvent, user } = props;
  const [code, setCode] = useState(null);

  const [inputs, setInputs] = useState({});

  useEffect(() => {
    setup();
  }, []);

  const triggerTOTPEvent = (event, data) => {
    if (onTOTPEvent) {
      onTOTPEvent(event, data);
    }
  };

  const handleInputChange = (evt) => {
    const { name, value } = evt.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const setup = () => {
    if (!Auth || typeof Auth.setupTOTP !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    Auth.setupTOTP(user)
      .then((data) => {
        setCode(data);
      })
      .catch((err) => console.debug('totp setup failed', err));
  };

  const verifyTotpToken = () => {
    if (!inputs) {
      console.error('no input');
      return;
    }

    const { totpCode } = inputs;
    Auth.verifyTotpToken(user, totpCode)
      .then(() => {
        Auth.setPreferredMFA(user, 'TOTP');
        message.success('Setup TOTP successfully!');
        triggerTOTPEvent('Setup TOTP', 'SUCCESS', user);
      })
      .catch((err) => {
        message.error('Setup TOTP failed!');
        console.error(err);
      });
  };

  const renderQrCode = () => {
    if (!code) return null;

    const issuer = encodeURI(I18n.get('AWSCognito'));
    const otpauthUrl = `otpauth://totp/${issuer}:${user.username}?secret=${code}&issuer=${issuer}`;
    return (
      <>
        <div className={totpQrcode}>
          <QRCode value={otpauthUrl} />
        </div>
      </>
    );
  };

  const qrSection = (
    <Space align='center' direction='vertical' style={{ width: '50%' }}>
      <Title level={5}>Scan the qr code</Title>
      <center>
        {renderQrCode(code)}
      </center>
    </Space>
  );

  const plainCodeSection = (
    <Space align='center' direction='vertical' style={{ height: '100%', width: '50%' }}>
      <Title level={5}>Or enter the setup key</Title>
      <Text style={{ top: '50%', bottom: '50%' }}>
        <pre>{code}</pre>
      </Text>
    </Space>
  );

  return (
    <Form layout='vertical'>
      <Divider orientation='left'>
        1. Set up the account in your authenticator application
      </Divider>
      <Row style={{ height: '100%' }} wrap={false}>
        {qrSection}
        <Divider orientation='center' type='vertical' style={{ width: '1px', height: '200px' }} />
        {plainCodeSection}
      </Row>

      <Divider orientation='left'>
        2. Verify
      </Divider>

      <Form.Item label='Enter here the security code your application shows after:'>
        <Input autoFocus name='totpCode' onChange={handleInputChange} />
      </Form.Item>
      <Form.Item>
        <Button type='primary' onClick={verifyTotpToken} block>
          Verify Security Token
        </Button>
      </Form.Item>
    </Form>
  );
};

TOTPSetup.defaultProps = {};

TOTPSetup.propTypes = {
  onTOTPEvent: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default TOTPSetup;
