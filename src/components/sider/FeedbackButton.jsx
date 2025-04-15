import {
  Button,
  Card,
  Dropdown,
  Input,
  Space,
} from 'antd';
import { QuestionCircleOutlined, InfoCircleFilled } from '@ant-design/icons';
import React, { useState } from 'react';
import fetchAPI from 'utils/http/fetchAPI';
import { Auth } from '@aws-amplify/auth';
import endUserMessages from 'utils/endUserMessages';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import handleError from 'utils/http/handleError';
import PropTypes from 'prop-types';

const { TextArea } = Input;

const FeedbackButton = (props) => {
  const { collapsed, buttonType } = props;
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
        <Card size='small' style={{ padding: '0.5em', width: '410px' }}>
          For help using the platform, check out:
          <div style={{ margin: '1em' }}>
            <a href='https://www.parsebiosciences.com/data-analysis' target='_blank' rel='noreferrer'>
              <InfoCircleFilled />
              {' '}
              Our website
            </a>
            {' '}
            <br />
            <a href='https://support.parsebiosciences.com/hc/en-us/articles/27076682137236-Trailmaker-User-Guide' target='_blank' rel='noreferrer'>
              <InfoCircleFilled />
              {' '}
              User guide
            </a>
            {' '}
            <br />
            <a href='https://support.parsebiosciences.com/hc/en-us/categories/360004765711-Computational-Support' target='_blank' rel='noreferrer'>
              <InfoCircleFilled />
              {' '}
              Support suite including troubleshooting guides
            </a>
            {' '}
            <br />
            <a href='https://courses.trailmaker.parsebiosciences.com/' target='_blank' rel='noreferrer'>
              <InfoCircleFilled />
              {' '}
              Free single cell RNA-seq data analysis course
            </a>
          </div>
          To report an issue or to receive 1-to-1 support from a member of our team, write an email to
          <a
            href='mailto:support@parsebiosciences.com'
            target='_blank'
            rel='noreferrer'
          >
            {' '}
            support@parsebiosciences.com
          </a>
          .
          <br />
          If your inquiry relates to a specific experiment, be sure to include the relevant Run ID or Project ID.
          <br />
          <br />
        </Card>
      ),
      key: 'feedback-button-contents',
      title: '',
    },
  ];

  let buttonStyle = {};
  if (buttonType === 'text') {
    buttonStyle = {
      color: 'hsla(0, 0%, 100%, .65)',
    };
  }

  return (
    <Dropdown
      open={visible}
      onOpenChange={(v) => setVisible(v)}
      menu={{ items: menuItems }}
      placement='topRight'
      trigger='click'
    >
      <Button type={buttonType} icon={<QuestionCircleOutlined />} style={buttonStyle}>
        {!collapsed && 'Support'}
      </Button>
    </Dropdown>
  );
};

FeedbackButton.defaultProps = {
  buttonType: 'default',
};

FeedbackButton.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  buttonType: PropTypes.string,
};

export default FeedbackButton;
