import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Auth from '@aws-amplify/auth';

import {
  Modal, Space, Checkbox, Typography,
  Button,
  Input,
  Divider,
} from 'antd';

import styles from 'components/data-management/TermsOfUseIntercept.module.css';

import pushNotificationMessage from 'utils/pushNotificationMessage';
import endUserMessages from 'utils/endUserMessages';
import { termsOfUseCognitoKey, institutionCognitoKey } from 'utils/constants';
import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';

const { Text } = Typography;

const TermsOfUseIntercept = (props) => {
  const { user, onOk } = props;

  const {
    attributes: {
      [termsOfUseCognitoKey]: originalAgreedPrivacyPolicy,
      [institutionCognitoKey]: originalInstitution,
    },
  } = user;

  const [agreedTerms, setAgreedTerms] = useState(originalAgreedPrivacyPolicy);
  const [institution, setInstitution] = useState(originalInstitution);

  const getDownloadTermsOfUseFunc = (file) => async () => {
    const signedUrl = await fetchAPI(`/v2/termsOfUse/${file}/download`);
    downloadFromUrl(signedUrl, { newTab: true });
  };

  return (
    <Modal
      title='Consent to the Trailmaker terms of use:'
      open
      centered
      className={styles['ok-to-the-right-modal']}
      cancelText='Sign out'
      cancelButtonProps={{ danger: true }}
      okButtonProps={{ disabled: agreedTerms !== 'true' }}
      closable={false}
      maskClosable={false}
      width={700}
      onOk={async () => {
        await Auth.updateUserAttributes(
          user,
          {
            [termsOfUseCognitoKey]: agreedTerms,
            [institutionCognitoKey]: institution,
          },
        )
          .then(() => {
            pushNotificationMessage('success', endUserMessages.ACCOUNT_DETAILS_UPDATED, 3);
            onOk();
          })
          .catch(() => pushNotificationMessage('error', endUserMessages.ERROR_SAVING, 3));
      }}
      onCancel={async () => Auth.signOut()}
    >
      <Space direction='vertical'>
        <Text strong>Welcome to Trailmaker!</Text>
        <Text>
          Trailmaker is available for free to all academic researchers.
          <br />
          <br />
          If you are an industry researcher who is currently a Parse customer,
          Trailmaker is also available for free.
          If you are an industry researcher who is not currently a Parse customer,
          a free 4-month trial of Trailmaker is available.
          {' '}
          <a href='mailto:support@parsebiosciences.com'>Contact us</a>
          {' '}
          to discuss pricing.
        </Text>
        <Space align='baseline' style={{ marginTop: 10 }}>
          <Text>
            <span style={{ color: '#ff0000', marginRight: 0 }}>*</span>
            Institution/Company:
          </Text>
          <Input style={{ minWidth: 300 }} value={institution} onChange={setInstitution} />
        </Space>
        <Divider style={{
          marginLeft: 0, paddingLeft: 0, marginTop: 15, marginBottom: 10,
        }}
        />
        <Space align='baseline'>
          <Checkbox
            defaultChecked={agreedTerms === 'true'}
            onChange={(e) => setAgreedTerms(e.target.checked.toString())}
          />
          <Text>
            <span style={{ color: '#ff0000' }}>*</span>
            I agree to the
            {' '}
            <Button type='link' style={{ padding: '0px' }} onClick={getDownloadTermsOfUseFunc('privacyPolicy')}>
              Privacy policy
            </Button>
            {', '}
            <Button type='link' style={{ padding: '0px' }} onClick={getDownloadTermsOfUseFunc('cookies')}>
              Cookie Policy
            </Button>
            {' and '}
            <Button type='link' style={{ padding: '0px' }} onClick={getDownloadTermsOfUseFunc('dataUse')}>
              Trailmaker Data Use Agreement
            </Button>
            .
          </Text>
        </Space>
      </Space>
    </Modal>
  );
};

TermsOfUseIntercept.propTypes = {
  user: PropTypes.object.isRequired,
  onOk: PropTypes.func.isRequired,
};

TermsOfUseIntercept.defaultProps = {};

export default TermsOfUseIntercept;
