import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { Auth } from 'aws-amplify';

import {
  Modal, Space, Checkbox, Typography,
  Button,
  Input,
  Divider,
} from 'antd';

import styles from 'components/data-management/TermsOfUseIntercept.module.css';

import { updateUserAttributes } from 'redux/actions/user';
import { useDispatch } from 'react-redux';
import {
  termsOfUseCognitoKey,
  institutionCognitoKey,
} from 'const';
import downloadTermsOfUse from 'utils/downloadTermsOfUse';
import IframeModal from 'utils/IframeModal';

const { Text } = Typography;

const TermsOfUseIntercept = (props) => {
  const dispatch = useDispatch();
  const { user } = props;

  const {
    attributes: {
      [termsOfUseCognitoKey]: originalAgreedPrivacyPolicy,
      [institutionCognitoKey]: originalInstitution,
    },
  } = user;

  const [readPrivacyAndCookie, setReadPrivacyAndCookie] = useState(originalAgreedPrivacyPolicy);
  const [agreedTerms, setAgreedTerms] = useState(originalAgreedPrivacyPolicy);
  const [institution, setInstitution] = useState(originalInstitution);

  const [dataUseVisible, setDataUseVisible] = useState(false);
  const [dataUseBlob, setDataUseBlob] = useState(null);

  const institutionFilledIn = useMemo(() => institution && institution.length > 0, [institution]);

  return (
    <Modal
      title='Consent to the Trailmaker terms of use:'
      open
      centered
      className={styles['ok-to-the-right-modal']}
      cancelText='Sign out'
      cancelButtonProps={{ danger: true }}
      okButtonProps={{ disabled: agreedTerms !== 'true' || readPrivacyAndCookie !== 'true' || !institutionFilledIn }}
      closable={false}
      maskClosable={false}
      width={700}
      onOk={async () => {
        await dispatch(updateUserAttributes(
          user,
          {
            [termsOfUseCognitoKey]: agreedTerms,
            [institutionCognitoKey]: institution,
          },
        ));
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
          <Input
            style={{ minWidth: 300 }}
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
            }}
          />
        </Space>
        <Divider style={{
          marginLeft: 0, paddingLeft: 0, marginTop: 15, marginBottom: 10,
        }}
        />
        <Space align='baseline'>
          <Checkbox
            defaultChecked={readPrivacyAndCookie === 'true'}
            onChange={(e) => setReadPrivacyAndCookie(e.target.checked.toString())}
          />
          <Text>
            <span style={{ color: '#ff0000' }}>*</span>
            I confirm I have read the
            {' '}
            <Button
              type='link'
              style={{ padding: '0px' }}
              onClick={() => window.open('https://www.parsebiosciences.com/privacy-policy/', '_blank').focus()}
            >
              Privacy policy
            </Button>
            {' and '}
            <Button
              type='link'
              style={{ padding: '0px' }}
              onClick={() => window.open('https://www.parsebiosciences.com/trailmaker-cookie-policy/', '_blank').focus()}
            >
              Trailmaker Cookie Policy
            </Button>
            .
          </Text>
        </Space>
        <Space align='baseline'>
          <Checkbox
            defaultChecked={agreedTerms === 'true'}
            onChange={(e) => setAgreedTerms(e.target.checked.toString())}
          />
          <Text>
            <span style={{ color: '#ff0000' }}>*</span>
            I accept the
            {' '}
            <Button
              type='link'
              style={{ padding: '0px' }}
              onClick={() => {
                setDataUseVisible(true);

                if (!dataUseBlob) {
                  downloadTermsOfUse(setDataUseBlob);
                }
              }}
            >
              Terms of Use Agreement
            </Button>
          </Text>
        </Space>
      </Space>

      {dataUseVisible && (
        <IframeModal onClose={() => setDataUseVisible(false)} blobToDisplay={dataUseBlob} />
      )}
    </Modal>
  );
};

TermsOfUseIntercept.propTypes = {
  user: PropTypes.object.isRequired,
};

TermsOfUseIntercept.defaultProps = {};

export default TermsOfUseIntercept;
