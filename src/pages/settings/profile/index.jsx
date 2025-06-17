import React, { useState } from 'react';
import { Auth } from 'aws-amplify';

import _ from 'lodash';
import {
  Form, Input, Empty, Row, Col, Button, Space, Divider,
} from 'antd';
import { useRouter } from 'next/router';
import { institutionCognitoKey, cookiesAgreedCognitoKey } from 'utils/constants';

import handleError from 'utils/http/handleError';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserAttributes, loadUser } from 'redux/actions/user';
import downloadTermsOfUse from 'utils/downloadTermsOfUse';
import IframeModal from 'utils/IframeModal';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import endUserMessages from 'utils/endUserMessages';
import MfaSetupButton from './MfaSetupButton';

const ProfileSettings = () => {
  const router = useRouter();

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.current);

  const [oldPasswordError, setOldPasswordError] = useState(null);
  const [newPasswordError, setNewPasswordError] = useState(null);
  const [emailError, setEmailError] = useState(null);

  const initialState = {
    changedPasswordAttributes: {},
    changedUserAttributes: {},
  };
  const [newAttributes, setNewAttributes] = useState(initialState);
  const { changedPasswordAttributes, changedUserAttributes } = newAttributes;
  const [dataUseVisible, setDataUseVisible] = useState(false);
  const [dataUseBlob, setDataUseBlob] = useState(null);

  const setChanges = (object) => {
    const newChanges = _.cloneDeep(newAttributes);
    _.merge(newChanges, object);
    setNewAttributes(newChanges);
  };

  const updateDetails = async () => {
    const { name, email } = changedUserAttributes;
    const { oldPassword, newPassword, confirmNewPassword } = changedPasswordAttributes;

    const invalidPasswordErrors = ['InvalidPasswordException', 'InvalidParameterException', 'NotAuthorizedException'];
    if (name || email) {
      setEmailError(false);
      await dispatch(
        updateUserAttributes(user, changedUserAttributes, () => setEmailError(true)),
      );
    }

    if (oldPassword || newPassword || confirmNewPassword) {
      setOldPasswordError(false);
      setNewPasswordError(false);

      // this should be updated in the case of changing the AWS Cognito password strength policy
      const passwordValidity = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

      if (confirmNewPassword !== newPassword) {
        setNewPasswordError("Passwords don't match.");
      } else if (oldPassword === newPassword) { // pragma: allowlist secret
        setNewPasswordError('The new password cannot match the old one.');
      } else if (!newPassword?.match(passwordValidity)) {
        setNewPasswordError('Password should include at least 8 characters, a number, special character, uppercase letter, lowercase letter.');
      } else {
        await Auth.changePassword(user, oldPassword, newPassword)
          .then(() => pushNotificationMessage('success', endUserMessages.ACCOUNT_DETAILS_UPDATED, 3))
          .catch((e) => {
            if (invalidPasswordErrors.includes(e.code)) {
              setOldPasswordError("Doesn't match old password.");
            } else {
              handleError(e, e.message);
            }
          });
      }
    }

    dispatch(loadUser());

    setNewAttributes(initialState);
  };
  const resetCookiesPreferences = async () => {
    function deleteAllCookies() {
      const cookies = document.cookie.split(';');
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        // Deleting cookie for the current path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        // Deleting cookie for all paths
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      });
    }
    try {
      await dispatch(updateUserAttributes(user, {
        [cookiesAgreedCognitoKey]: '',
      }));
      deleteAllCookies();
    } catch (e) {
      handleError(e, e.message);
    }
  };
  // the user might not be loaded already - then return <Empty/>
  if (user) {
    return (
      <Space direction='vertical' style={{ width: '100%', padding: '20px', background: ' white' }}>
        <Row type='flex'>
          <Col xl={{ span: 12, offset: 6 }} span={24}>

            <Form
              layout='horizontal'
              labelCol={{ span: '10' }}
              wrapperCol={{ span: '18' }}
            >
              <h2 style={{ marginTop: '16px' }}>Profile settings:</h2>
              <Form.Item label='Full name'>
                <Input
                  onChange={
                    (e) => setChanges({ changedUserAttributes: { name: e.target.value } })
                  }
                  placeholder={user.attributes.name}
                />
              </Form.Item>
              <Form.Item
                label='Email address:'
                validateStatus={emailError ? 'error' : 'success'}
                help={emailError ? 'Invalid email address format' : ''}
              >
                <Input
                  type='email'
                  // disabled until we can validate the changing of email
                  disabled
                  onChange={(e) => (
                    setChanges({ changedUserAttributes: { email: e.target.value } })
                  )}
                  placeholder={user.attributes.email}
                />
              </Form.Item>
              {/* no information for the institution currently */}
              <Form.Item label='Institution:'>
                <Input disabled placeholder={user.attributes[institutionCognitoKey]} />
              </Form.Item>
              <center>
                <Button
                  onClick={resetCookiesPreferences}
                  disabled={!user.attributes[cookiesAgreedCognitoKey]}
                >
                  Reset Cookies Preferences
                </Button>
              </center>
              <h2 style={{ marginTop: '40px' }}>Password settings:</h2>
              <Form.Item
                label='Current password:' // pragma: allowlist secret
                validateStatus={oldPasswordError ? 'error' : 'success'}
                help={oldPasswordError || ''}
              >
                <Input.Password
                  onChange={(e) => (
                    setChanges({ changedPasswordAttributes: { oldPassword: e.target.value } })
                  )} // pragma: allowlist secret
                  visibilityToggle={false}
                />
              </Form.Item>
              <Form.Item
                label='New password:' // pragma: allowlist secret
                validateStatus={newPasswordError ? 'error' : 'success'}
                help={newPasswordError || ''}
              >
                <Input.Password
                  onChange={(e) => (
                    setChanges({ changedPasswordAttributes: { newPassword: e.target.value } })
                  )} // pragma: allowlist secret
                  visibilityToggle={false}
                />
              </Form.Item>
              <Form.Item
                label='Confirm new password:' // pragma: allowlist secret
                validateStatus={newPasswordError ? 'error' : 'success'}
                help={newPasswordError || ''}
              >
                <Input.Password
                  onChange={(e) => (
                    setChanges({
                      changedPasswordAttributes: { confirmNewPassword: e.target.value },
                    })
                  )} // pragma: allowlist secret
                  visibilityToggle={false}
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col xl={{ span: 12, offset: 6 }} span={24}>
            <Row justify='end'>
              <Space>
                <Button
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type='primary'
                  onClick={() => updateDetails()}
                >
                  Save changes
                </Button>
              </Space>
            </Row>
          </Col>
        </Row>
        <Row type='flex'>
          <Col xl={{ span: 12, offset: 6 }} span={24}>
            <h2 style={{ marginTop: '40px' }}>Multi-factor authentication:</h2>
            <p>
              Multi-factor authentication (MFA) adds a layer of security to your account
              by requesting an extra authentication step.
            </p>
            <center>
              <MfaSetupButton user={user} />
            </center>
          </Col>
        </Row>
        <center>
          <Divider style={{ marginTop: '40px' }} />
          <h2>Policy Documents:</h2>
          <Space>
            <Button
              type='link'
              onClick={() => window.open('https://www.parsebiosciences.com/privacy-policy/', '_blank').focus()}
            >
              Privacy Policy
            </Button>
            <Button
              type='link'
              onClick={() => window.open('https://www.parsebiosciences.com/trailmaker-cookie-policy/', '_blank').focus()}
            >
              Cookie Policy
            </Button>
            <Button
              type='link'
              onClick={() => {
                setDataUseVisible(true);

                if (!dataUseBlob) {
                  downloadTermsOfUse(setDataUseBlob);
                }
              }}
            >
              Terms of Use
            </Button>
          </Space>
          <Divider style={{ marginTop: '20px' }} />
          {dataUseVisible && (
            <IframeModal onClose={() => setDataUseVisible(false)} blobToDisplay={dataUseBlob} />
          )}
        </center>
      </Space>
    );
  }
  return (<Empty />);
};

export default ProfileSettings;
