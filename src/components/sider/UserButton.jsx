import React, { useEffect } from 'react';
import {
  Avatar, Button, Menu, Dropdown,
} from 'antd';
import Link from 'next/link';
import { Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import endUserMessages from 'utils/endUserMessages';
import { resetTrackingId } from 'utils/tracking';
import handleError from 'utils/http/handleError';
import { loadUser } from 'redux/actions/user';
import { useDispatch, useSelector } from 'react-redux';
import signIn from 'utils/signIn';

const UserButton = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.current);

  useEffect(() => {
    Hub.listen('auth', ({ payload: { event } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          dispatch(loadUser());
          break;
        case 'signOut':
          resetTrackingId();
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          handleError('error', endUserMessages.ERROR_SIGN_IN);
          break;
        default:
          break;
      }
    });
  }, []);

  const menuItems = [
    {
      type: 'group',
      label: `Signed in as ${user?.attributes.name}`,
      key: 'singed-in-username',
    },
    {
      disabled: true,
      label: <div>Your profile</div>,
      key: 'user-profile',
    },
    {
      label: <Link href='/settings/profile'>Settings</Link>,
      key: 'user-settings',
    },
    {
      type: 'divider',
    },
    {
      label: <div>Sign out</div>,
      key: 'user-signout',
      onClick: async () => {
        Auth.signOut();
      },
    },
  ];

  return user ? (
    <Dropdown
      menu={{ items: menuItems }}
      inlineIndent='36'
      trigger={['click']}
      placement='topRight'
      inlineCollapsed='false'
      mode='vertical'
      style={{ minWidth: '200px' }}
    >
      <Button
        aria-label='User settings'
        type='text'
        style={{
          border: 'none',
          padding: 0,
          margin: 0,
        }}
        icon={(
          <Avatar
            style={{
              backgroundColor: '#f56a00',
              verticalAlign: 'middle',
            }}
            size='medium'
          >
            {user.attributes.name[0].toUpperCase()}
          </Avatar>
        )}
      />
    </Dropdown>
  ) : (
    <Button type='dashed' onClick={() => signIn()}>
      Sign in
    </Button>
  );
};

UserButton.propTypes = {};

UserButton.defaultProps = {};

export default UserButton;
