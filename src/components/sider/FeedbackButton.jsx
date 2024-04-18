import {
  Button,
  Card,
  Dropdown,
  Input,
  Space,
  List,
} from 'antd';
import { QuestionCircleOutlined, InfoCircleFilled } from '@ant-design/icons';
import React, { useState } from 'react';
import fetchAPI from 'utils/http/fetchAPI';
import Auth from '@aws-amplify/auth';
import endUserMessages from 'utils/endUserMessages';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import handleError from 'utils/http/handleError';
import PropTypes from 'prop-types';

const { TextArea } = Input;

const FeedbackButton = (props) => {
  const { collapsed } = props;
  const [visible, setVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const submitFeedback = async () => {
    setVisible(false);
    const pageContext = [
      {
        type: 'mrkdwn',
        text: '*URL posted from:*',
      },
      {
        type: 'mrkdwn',
        text: window.location.href,
      },
    ];

    let user;
    try {
      user = await Auth.currentAuthenticatedUser();
    } catch (e) {
      console.warn('User not authenticated');
    }

    const userContext = user ? [
      {
        type: 'mrkdwn',
        text: '*User email:*',
      },
      {
        type: 'mrkdwn',
        text: user.attributes.email,
      },

      {
        type: 'mrkdwn',
        text: '*User name:*',
      },
      {
        type: 'plain_text',
        text: user.attributes.name,
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

    const feedbackData = {
      channel: 'feedback',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: feedbackText,
          },
        },
        {
          type: 'context',
          elements: [
            ...pageContext,
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
        body: JSON.stringify({ data: feedbackData }),
      });

      setFeedbackText('');
      pushNotificationMessage('success', endUserMessages.FEEDBACK_SUCCESSFUL);
    } catch (e) {
      handleError(e, endUserMessages.FEEDBACK_ERROR);
    }
  };

  const menuItems = [
    {
      label: (
        <Card size='small' style={{ padding: '0.5em', width: '400px' }}>
          For help using the platform, check out:
          <div style={{ margin: '1em' }}>
            <a href='https://www.biomage.net/user-guide' target='_blank' rel='noreferrer'>
              <InfoCircleFilled />
              {' '}
              User guide
            </a>
            {' '}
            <br />
            <a href='https://www.youtube.com/@biomageltd4616/featured' target='_blank' rel='noreferrer'>
              <InfoCircleFilled />
              {' '}
              Tutorial videos
            </a>
            <br />
            <a href='https://courses.biomage.net' target='_blank' rel='noreferrer'>
              <InfoCircleFilled />
              {' '}
              Free single cell RNA-seq data analysis course
            </a>
          </div>
          To report an issue or to receive 1-to-1 support from a member of our team:
          <br />
          <br />
          <Space direction='vertical' style={{ width: '100%' }}>
            <TextArea
              value={feedbackText}
              onChange={(e) => {
                setFeedbackText(e.target.value);
              }}
              rows={4}
              placeholder='Please write your message here to provide feedback or report issues on Cellenics. A member of our team will get back to you as soon as possible.'
              bordered
              ref={(ref) => { if (ref) { ref.focus(); } }}
              style={{
                resize: 'none', width: 300, outline: 'none',
              }}
            />
            <Space>
              <Button size='small' onClick={() => setVisible(false)}>Cancel</Button>
              <Button size='small' type='primary' onClick={submitFeedback}>Send</Button>
            </Space>
          </Space>
        </Card>
      ),
      key: 'feedback-button-contents',
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
      <Button type='text' icon={<QuestionCircleOutlined />} style={{ color: 'hsla(0, 0%, 100%, .65)' }}>
        {!collapsed && 'Support'}
      </Button>
    </Dropdown>
  );
};
FeedbackButton.propTypes = {
  collapsed: PropTypes.bool.isRequired,
};

export default FeedbackButton;
