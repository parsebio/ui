import React, { useState, useEffect } from 'react';
import { cookiesAgreedCognitoKey } from 'const';
import { useSelector, useDispatch } from 'react-redux';
import {
  Modal, Button, Checkbox, Divider, Alert, Space,
} from 'antd';
import { updateUserAttributes } from 'redux/actions/user';

const CookieBanner = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.current);
  const cookiesAgreed = user.attributes[cookiesAgreedCognitoKey];

  const [modalVisible, setModalVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(cookiesAgreed === undefined);
  const [consent, setConsent] = useState({ performance: false });

  useEffect(() => {
    if (cookiesAgreed !== undefined) {
      setBannerVisible(false);
    } else {
      setBannerVisible(true);
    }
  }, [cookiesAgreed]);

  const updateUserChoice = async (consentChoice) => {
    await dispatch(updateUserAttributes(user, {
      [cookiesAgreedCognitoKey]: consentChoice.toString(),
    }));
  };

  const handleAcceptAll = async () => {
    setBannerVisible(false);
    setModalVisible(false);
    await updateUserChoice(true);
  };

  const handleRejectAll = async () => {
    setBannerVisible(false);
    setModalVisible(false);
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
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: 1000,
        }}
        >
          <Alert
            message='We use cookies to improve your experience on our site. You can customize your preferences.'
            description={<a href='https://www.parsebiosciences.com/trailmaker-cookie-policy/' target='_blank' rel='noopener noreferrer'>Read our full cookie policy</a>}
            type='info'
            showIcon
            style={{ fontSize: '16px', padding: '16px 24px' }} // Adjusted padding for better spacing
            action={(
              <Space>
                <Button size='large' type='primary' onClick={handleRejectAll}>
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
          <Button key='save' type='primary' onClick={handleSavePreferences}>
            Save Preferences
          </Button>,
          <Button key='reject' type='primary' onClick={handleRejectAll}>
            Reject Other Cookies
          </Button>,
          <Button key='accept' type='primary' onClick={handleAcceptAll}>
            Accept All
          </Button>,
        ]}
      >
        <Divider style={{ marginTop: 0 }}>Essential Cookies</Divider>
        <Checkbox checked disabled>
          Essential cookies are crucial to your experience of a website,
          enabling core features like user logins and account management.
        </Checkbox>

        <Divider>Other cookies and Session Replay Technology</Divider>
        <Checkbox
          checked={consent.performance}
          onChange={(e) => setConsent({ ...consent, performance: e.target.checked })}
        >
          We track how you use the website during your visit.
          This includes taking a recording of your actions on the website
          (“Session Replay Technology”). You can ask us not to do it by
          unchecking this checkbox or clicking “reject other cookies”.
        </Checkbox>
      </Modal>
    </div>
  );
};

export default CookieBanner;
