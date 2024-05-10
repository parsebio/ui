import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Auth from '@aws-amplify/auth';

import {
  Modal, Space, Checkbox, Typography,
  Button,
} from 'antd';

import styles from 'components/data-management/TermsOfUseIntercept.module.css';

import pushNotificationMessage from 'utils/pushNotificationMessage';
import endUserMessages from 'utils/endUserMessages';
import { termsOfUseCognitoKey } from 'utils/constants';
import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';

const { Text } = Typography;

const TermsOfUseIntercept = (props) => {
  const { user, onOk } = props;

  const {
    attributes: {
      [termsOfUseCognitoKey]: originalAgreedPrivacyPolicy,
    },
  } = user;

  const [agreedTerms, setAgreedTerms] = useState(originalAgreedPrivacyPolicy);

  const getDownloadTermsOfUseFunc = (file) => async () => {
    const signedUrl = await fetchAPI(`/v2/termsOfUse/${file}/download`);
    downloadFromUrl(signedUrl, { newTab: true });
  };

  return (
    <Modal
      title='Agree to the privacy policy to continue using Trailmaker'
      open
      centered
      className={styles['ok-to-the-right-modal']}
      cancelText='Sign out'
      cancelButtonProps={{ danger: true }}
      okButtonProps={{ disabled: agreedTerms !== 'true' }}
      closable={false}
      maskClosable={false}
      width={600}
      onOk={async () => {
        await Auth.updateUserAttributes(
          user,
          {
            [termsOfUseCognitoKey]: agreedTerms,
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
        <Space align='baseline'>
          <Checkbox
            defaultChecked={agreedTerms === 'true'}
            onChange={(e) => setAgreedTerms(e.target.checked.toString())}
          />
          <Text>
            <span style={{ color: '#ff0000' }}>* </span>
            I accept the terms of the
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
        <Text>
          If you want to discuss any of the policies, reach out to
          {' '}
          support@parsebiosciences.com
        </Text>
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
