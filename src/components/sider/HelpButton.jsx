import React, { useState } from 'react';
import { Button, Dropdown, Card } from 'antd';
import { QuestionCircleOutlined, DownOutlined } from '@ant-design/icons';

const HelpButton = () => {
  const [visible, setVisible] = useState(false);
  const menuItems = [
    {
      label: (
        <Card size='small' style={{ padding: '1em', width: '265px' }}>
          Ask questions about how to use Trailmaker and make feature requests on the
          {' '}
          <a href='https://community.biomage.net/' target='_blank' rel='noreferrer'>Trailmaker community forum</a>
          !
          The team will reply to your message as soon as possible.
          <br />
          <br />
          Check out the
          {' '}
          <a href='https://www.biomage.net/user-guide' target='_blank' rel='noreferrer'>
            user guide
            {' '}
          </a>
          and
          {' '}
          <a href='https://www.youtube.com/@biomageltd4616/featured' target='_blank' rel='noreferrer'> tutorial videos </a>
          <br />
        </Card>
      ),
      key: 'help-button-contents',
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
      <Button
        type='dashed'
        icon={<QuestionCircleOutlined />}
      >
        Need help?
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default HelpButton;
