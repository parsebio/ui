import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { UserAddOutlined } from '@ant-design/icons';
import {
  Modal, Button, Space, Row, Col, Card, Avatar, Select, Typography, Popconfirm,
} from 'antd';
import { Auth } from '@aws-amplify/auth';
import { loadExperiments } from 'redux/actions/experiments';
import loadRoles from 'utils/data-management/experimentSharing/loadRoles';
import sendInvites from 'utils/data-management/experimentSharing/sendInvites';
import revokeRole from 'utils/data-management/experimentSharing/revokeRole';

const { Text } = Typography;

const ShareProjectModal = (props) => {
  const dispatch = useDispatch();
  const { onCancel, project, explorerInfoText } = props;
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('explorer');
  const [canTransferOwnership, setCanTransferOwnership] = useState(false);

  const fetchRoles = async () => {
    const getCurrentUser = await Auth.currentAuthenticatedUser();
    setCurrentUser(getCurrentUser.attributes.email);

    const userRole = await loadRoles(project.id);
    const currentUserRole = userRole.find((user) => user.email === getCurrentUser.attributes.email);

    // if the current user is not in the list of roles, it could mean that its an admin user
    // the actual admin user check is done in the backend
    if (currentUserRole.role === 'owner' || getCurrentUser.attributes.email.includes('+admin@parsebiosciences.com')) {
      setCanTransferOwnership(true);
    }

    setUsersWithAccess(userRole);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const changeSelectedUsers = (selectedUsers) => {
    const newUser = selectedUsers[selectedUsers.length - 1];
    // check if the entry is in a valid email address format
    const isEmailInvalid = newUser && !newUser?.toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
    if (!isEmailInvalid) {
      if (role === 'owner') {
        // Only allow one email when the owner role is selected
        setAddedUsers([newUser]);
      } else {
        setAddedUsers(selectedUsers);
      }
    }
  };

  const okButtonText = addedUsers.length ? 'Add' : 'Done';
  const cancelButton = addedUsers.length ? (
    <Button onClick={() => setAddedUsers([])}>Cancel</Button>
  ) : null;

  const inviteUsers = async () => {
    if (!addedUsers.length) return;

    await sendInvites(
      addedUsers,
      {
        id: project.id,
        name: project.name,
        role,
      },
    );
    if (role === 'owner') {
      dispatch(loadExperiments());
    }
    onCancel();
  };

  return (
    <Modal
      open
      title={[<UserAddOutlined key='icon' />, 'Share with collaborators']}
      onCancel={onCancel}
      okButtonText='Done'
      footer={(
        <Space direction='horizontal'>
          {cancelButton}
          {role === 'owner' ? (
            <Popconfirm
              title={() => (
                <div>
                  This action will transfer the ownership permissions to
                  {' '}
                  <b>{addedUsers[0]}</b>
                  .
                  {' '}
                  <br />
                  You will no longer have access to this project.
                  {' '}
                  <br />
                  Are you sure you want to transfer owner permissions?
                </div>
              )}
              onConfirm={inviteUsers}
              okText='Yes'
              cancelText='No'
              disabled={!addedUsers.length}
            >
              <Button type='primary'>{okButtonText}</Button>
            </Popconfirm>
          ) : (
            <Button onClick={() => inviteUsers()} type='primary'>{okButtonText}</Button>
          )}
        </Space>
      )}
      width='650px'
    >
      <Space direction='vertical' style={{ width: '100%' }}>
        <Text strong>
          {project.name}
        </Text>
        <Row gutter={10} style={{ width: '110%' }}>
          <Col span={18}>
            <Select
              value={addedUsers}
              style={{ width: '100%' }}
              mode='tags'
              placeholder='Input an email address. Add multiple addresses with enter.'
              onChange={changeSelectedUsers}
            />
          </Col>
          <Col span={6}>
            <Select defaultValue='explorer' onChange={(val) => setRole(val)}>
              <Select.Option key='explorer' value='explorer'> Explorer </Select.Option>
              <Select.Option key='owner' value='owner' disabled={!canTransferOwnership}> Owner </Select.Option>
            </Select>
          </Col>
        </Row>

        <Row>
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            <Card key='users' style={{ width: '100%', height: '20rem', overflowY: 'auto' }}>
              {
                usersWithAccess.map((user) => (
                  <Row gutter={10} key={user.email}>
                    <Col span={3}>
                      <Avatar
                        style={{
                          backgroundColor: '#f56a00',
                        }}
                        size='large'
                      >
                        {user.name[0].toUpperCase()}
                      </Avatar>
                    </Col>
                    <Col span={13} flex='auto'>
                      <p>
                        {user.name}
                        {' '}
                        {user.email === currentUser ? '(You)' : ''}
                        <br />
                        <span style={{ color: 'grey' }}>{user.email}</span>
                      </p>
                    </Col>
                    <Col span={4}>
                      <p style={{ marginTop: '0.5em' }}>{user.role}</p>
                    </Col>
                    <Col span={2}>
                      <Button
                        type='primary'
                        danger
                        onClick={() => {
                          revokeRole(
                            user.email,
                            { id: project.id, name: project.name },
                          );

                          onCancel();
                        }}
                        disabled={user.email === currentUser}
                      >
                        Revoke
                      </Button>
                    </Col>
                  </Row>
                ))
              }
              <Row gutter={10} />
            </Card>
            <Text>
              <b>Explorer: </b>
              {explorerInfoText}
            </Text>
          </Space>
        </Row>
      </Space>
    </Modal>
  );
};

ShareProjectModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  explorerInfoText: PropTypes.string.isRequired,
};

export default ShareProjectModal;
