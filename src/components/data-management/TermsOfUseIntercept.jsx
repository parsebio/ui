import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Auth from '@aws-amplify/auth';

import {
  Modal, Space, Checkbox, Typography,
} from 'antd';

import styles from 'components/data-management/TermsOfUseIntercept.module.css';

import pushNotificationMessage from 'utils/pushNotificationMessage';
import endUserMessages from 'utils/endUserMessages';
import { termsOfUseKeys } from 'utils/constants';

const { Text } = Typography;

const {
  privacyPolicy,
  cookies,
  dataUse,
} = termsOfUseKeys;

const TermsOfUseIntercept = (props) => {
  const { user, onOk } = props;

  const {
    attributes: {
      [privacyPolicy]: originalAgreedPrivacyPolicy,
      [cookies]: originalAgreedCookies,
      [dataUse]: originalAgreedDataUse,
    },
  } = user;

  const [agreedPrivacyPolicy, setAgreedPrivacyPolicy] = useState(originalAgreedPrivacyPolicy);
  const [agreedCookies, setAgreedCookies] = useState(originalAgreedCookies);
  const [agreedDataUse, setAgreedDataUse] = useState(originalAgreedDataUse);

  const agreedToAllTerms = useMemo(() => [agreedPrivacyPolicy, agreedCookies, agreedDataUse].every((value) => value === 'true'),
    [agreedPrivacyPolicy, agreedCookies, agreedDataUse]);

  const privacyPolicyUrl = 'https://static1.squarespace.com/static/5f355513fc75aa471d47455c/t/64e74c9b4fc1e66b2434b9fb/1692880027872/Biomage_PrivacyPolicy_Aug2023.pdf';

  return (
    <Modal
      title='Agree to the privacy policy to continue using Trailmaker'
      open
      centered
      className={styles['ok-to-the-right-modal']}
      cancelText='Sign out'
      cancelButtonProps={{ danger: true }}
      okButtonProps={{ disabled: !agreedToAllTerms }}
      closable={false}
      maskClosable={false}
      onOk={async () => {
        await Auth.updateUserAttributes(
          user,
          {
            [privacyPolicy]: agreedPrivacyPolicy,
            [cookies]: agreedCookies,
            [dataUse]: agreedDataUse,
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
        <Space align='start'>
          <Checkbox
            defaultChecked={agreedPrivacyPolicy === 'true'}
            onChange={(e) => setAgreedPrivacyPolicy(e.target.checked.toString())}
          />
          <Text>
            <span style={{ color: '#ff0000' }}>* </span>
            I accept the terms of the
            {' '}
            <a href={privacyPolicyUrl} target='_blank' rel='noreferrer'> Privacy policy</a>
            .
          </Text>
        </Space>
        <Space align='start'>
          <Checkbox
            defaultChecked={agreedCookies === 'true'}
            onChange={(e) => setAgreedCookies(e.target.checked.toString())}
          />
          <Text>
            <span style={{ color: '#ff0000' }}>* </span>
            I agree to the
            {' '}
            <a href={privacyPolicyUrl} target='_blank' rel='noreferrer'> Parse Biosciences Cookie Policy</a>
            .
          </Text>
        </Space>
        <Space align='start'>
          <Checkbox
            defaultChecked={agreedDataUse === 'true'}
            onChange={(e) => setAgreedDataUse(e.target.checked.toString())}
          />
          <Text>
            <span style={{ color: '#ff0000' }}>* </span>
            I agree to the
            {' '}
            <a href={privacyPolicyUrl} target='_blank' rel='noreferrer'> Trailmaker Data Use Agreement</a>
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
