import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { I18n } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import {
  Form, Input, Button, Typography, message,
  Space,
} from 'antd';

import { totpQrcode } from '@aws-amplify/ui';
import QRCode from 'qrcode.react';

const { Title } = Typography;

const TOTPSetup = (props) => {
  const { onTOTPEvent, user } = props;
  const [code, setCode] = useState(null);
  const [setupMessage, setSetupMessage] = useState(null);
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
    setSetupMessage(null);
    const { name, value } = evt.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const setup = () => {
    setSetupMessage(null);

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
        <Form.Item label={I18n.get('Enter here the security code your application shows after scanning:')}>
          <Input autoFocus name='totpCode' onChange={handleInputChange} />
        </Form.Item>
      </>
    );
  };

  return (
    <Form layout='vertical'>
      <Title level={5}>Enter the setup key: </Title>
      <Space>{code}</Space>
      <Title level={5}>{I18n.get('Enter the setup key or scan the qr code')}</Title>
      <center>
        {renderQrCode(code)}
      </center>
      <Form.Item>
        <Button type='primary' onClick={verifyTotpToken} block>
          {I18n.get('Verify Security Token')}
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
