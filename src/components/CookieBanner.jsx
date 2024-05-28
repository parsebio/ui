import React, { useState, useEffect } from 'react';
import { cookiesAgreedCognitoKey } from 'utils/constants';
import { useSelector } from 'react-redux';
import {
  Modal, Button, Checkbox, Divider, Alert, Space,
} from 'antd';
import Auth from '@aws-amplify/auth';

const CookieBanner = () => {
  const user = useSelector((state) => state.user.current);
  const cookiesAgreed = user.attributes[cookiesAgreedCognitoKey];

  const [modalVisible, setModalVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(cookiesAgreed === undefined);
  const [consent, setConsent] = useState({ performance: false });

  useEffect(() => {
    if (cookiesAgreed !== undefined) {
      setBannerVisible(false);
    }
  }, [cookiesAgreed]);

  const updateUserChoice = async (consentChoice) => {
    await Auth.updateUserAttributes(user, {

      [cookiesAgreedCognitoKey]: consentChoice.toString(),
    });
  };

  const handleAcceptAll = async () => {
    setBannerVisible(false);
    await updateUserChoice(true);
  };

  const handleRejectAll = async () => {
    setBannerVisible(false);
    await updateUserChoice(false);
  };

  const handleSavePreferences = async () => {
    setModalVisible(false);
    setBannerVisible(false);
    await updateUserChoice(consent.performance);
  };

  const handleCustomize = () => {
    setModalVisible(true);
  };
  return (
    <div>
      {bannerVisible && (
        <div style={{
          position: 'absolute', bottom: 0, width: '100%', background: '#b08bc4', zIndex: 1000, height: '10%',
        }}
        >
          <Alert
            message='We use cookies to improve your experience on our site. You can customize your preferences.'
            type='info'
            showIcon
            style={{ height: '100%', fontSize: '16px' }} // Increased font size for the alert text
            action={(
              <Space>
                <Button size='large' type='default' onClick={handleRejectAll}>
                  Reject
                </Button>
                <Button size='large' type='primary' onClick={handleCustomize}>
                  Customize
                </Button>
                <Button size='large' type='primary' onClick={handleAcceptAll}>
                  Accept All
                </Button>
              </Space>
            )}
          />
        </div>
      )}

      <Modal
        title='Cookie Settings'
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key='reject' onClick={handleRejectAll}>
            Reject All
          </Button>,
          <Button key='accept' type='primary' onClick={handleAcceptAll}>
            Accept All
          </Button>,
          <Button key='save' type='primary' onClick={handleSavePreferences}>
            Save Preferences
          </Button>,
        ]}
      >
        <Divider>Essential Cookies</Divider>
        <Checkbox checked disabled>
          Essential cookies are crucial to your experience of a website, enabling core features like user logins, account management, shopping carts, and payment processing.
        </Checkbox>

        <Divider>Other cookies and Session Replay Technology</Divider>
        <Checkbox
          checked={consent.performance}
          onChange={(e) => setConsent({ ...consent, performance: e.target.checked })}
        >
          Performance cookies track how you use a website during your visit. Typically, this information is anonymous and aggregated.
          They help us understand visitor usage patterns, identify and diagnose problems or errors you may encounter, and make better decisions in improving the overall website experience.
        </Checkbox>
      </Modal>
    </div>
  );
};

export default CookieBanner;
