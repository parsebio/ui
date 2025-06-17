import {
  Button,
  Card,
  Dropdown,
  Input,
  Space,
  Tooltip,
} from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import handleError from 'utils/http/handleError';
import validateInput, { rules } from 'utils/validateInputs';

import endUserMessages from 'utils/endUserMessages';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import fetchAPI from 'utils/http/fetchAPI';
import PropTypes from 'prop-types';

const initialMessage = 'Hi,\n\nCheck out Trailmaker. It will make your single-cell analysis easier.';

const ReferralButton = (props) => {
  const { collapsed } = props;
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [customMessage, setCustomMessage] = useState(initialMessage);

  const submitReferral = async () => {
    setVisible(false);

    let user;
    try {
      user = await Auth.currentAuthenticatedUser();
    } catch (e) {
      console.warn('User not authenticated');
    }

    const userContext = user ? [
      {
        type: 'mrkdwn',
        text: '*From:*',
      },
      {
        type: 'mrkdwn',
        text: user.attributes.name,

      },
      {
        type: 'mrkdwn',
        text: '*Email:*',
      },
      {
        type: 'plain_text',
        text: user.attributes.email,
      },
      {
        type: 'mrkdwn',
        text: '*Domain:*',
      },
      {
        type: 'plain_text',
        text: window.location.hostname,
      },
      {
        type: 'mrkdwn',
        text: '*User UUID:*',
      },
      {
        type: 'plain_text',
        text: user.username,
      },
    ] : [];

    const referralData = {
      channel: 'referrals',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: `To: ${email}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: `Message:\n ${customMessage}`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            ...userContext,
          ],
        },
      ],
    };

    try {
      await fetchAPI('/v2/sendSlackMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: referralData }),
      });

      setEmail('');
      setCustomMessage(initialMessage);
      pushNotificationMessage('success', endUserMessages.REFERRAL_SUCCESSFUL);
    } catch (e) {
      handleError(e, endUserMessages.REFERRAL_ERROR);
    }
  };

  const menuItems = [
    {
      label: (
        <Card size='small' style={{ padding: '1em', width: '300px' }}>
          <Space direction='vertical' style={{ width: '100%' }}>
            Provide your colleague&apos;s email address to recommend Trailmaker.
            <Input
              label='Email'
              onChange={(e) => {
                const { isValid } = validateInput(e.target.value, rules.VALID_EMAIL);

                setIsEmailValid(isValid);
                setEmail(e.target.value);
              }}
              placeholder={'Your friend\'s email address'}
            />
            <Space>
              <Button size='small' onClick={() => setVisible(false)}>Cancel</Button>
              <Tooltip
                title={!isEmailValid ? 'Please enter a valid email address' : ''}
              >
                <Button size='small' type='primary' disabled={!isEmailValid} onClick={submitReferral}>Send invite</Button>
              </Tooltip>
            </Space>
            Note that Insights projects can be shared with collaborators
            to enable them to explore projects that you own.
            <br />
            To do this, use the Share button in
            <a target='_blank' href='/data-management' rel='noreferrer'>Insights.</a>

          </Space>
        </Card>
      ),
      key: 'referral-button-contents',
      title: '',
    },
  ];

  return (
    <Dropdown
      open={visible}
      onOpenChange={(v) => setVisible(v)}
      menu={{ items: menuItems }}
      placement='topRight'
      trigger='click'
    >
      <Button type='text' icon={<TeamOutlined />} style={{ color: 'hsla(0, 0%, 100%, .65)' }}>
        {!collapsed && 'Recommend'}
      </Button>
    </Dropdown>
  );
};
ReferralButton.propTypes = {
  collapsed: PropTypes.bool.isRequired,
};

export default ReferralButton;
