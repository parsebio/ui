import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { UserAddOutlined } from '@ant-design/icons';
import {
  Modal, Button, Space, Row, Col, Card, Avatar, Select, Typography, Popconfirm,
} from 'antd';
import { Auth } from '@aws-amplify/auth';
import { removeExperiment } from 'redux/actions/experiments';
import { removeSecondaryAnalysis } from 'redux/actions/secondaryAnalyses';
import loadRoles from 'utils/data-management/experimentSharing/loadRoles';
import sendInvites from 'utils/data-management/experimentSharing/sendInvites';
import revokeRole from 'utils/data-management/experimentSharing/revokeRole';
import { getHasPermissions } from 'redux/selectors';
import { permissions } from 'utils/constants';
import PermissionsChecker from 'utils/PermissionsChecker';

const { Text } = Typography;

const ShareProjectModal = (props) => {
  const dispatch = useDispatch();
  const { onCancel, project, projectType } = props;
  const [usersWithAccess, setUsersWithAccess] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('explorer');
  const [canTransferOwnership, setCanTransferOwnership] = useState(false);

  const hasPermissions = useSelector(
    getHasPermissions(project.id, permissions.READ_USER_ACCESS, projectType),
  );
  const storedCurrentUserRole = useSelector((state) => (
    projectType === 'experiment' ? state.experiments[project.id].accessRole : null
  ));

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (role === 'owner') {
      setAddedUsers(addedUsers[0] ? [addedUsers[0]] : []);
    }
  }, [role]);

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
        setAddedUsers(newUser ? [newUser] : []);
      } else {
        setAddedUsers(selectedUsers.map(_.toLower));
      }
    }
  };

  const fetchRoles = async () => {
    const getCurrentUser = await Auth.currentAuthenticatedUser();
    const { email, name } = getCurrentUser.attributes;

    setCurrentUser(email);

    if (projectType === 'experiment' && !hasPermissions) {
      setUsersWithAccess([{ email, name, role: storedCurrentUserRole }]);
      return;
    }

    const userRole = await loadRoles(project.id);
    const currentUserRole = userRole.find((user) => user.email === getCurrentUser.attributes.email);

    // if the current user is not in the list of roles, it could mean that its an admin user
    // the actual admin user check is done in the backend

    if (currentUserRole?.role === 'owner' || email.includes('+admin@parsebiosciences.com')) {
      setCanTransferOwnership(true);
    }

    setUsersWithAccess(userRole);
  };

  const revokeAccess = useCallback(async (user) => {
    await revokeRole(
      user.email,
      { id: project.id, name: project.name },
    );

    if (user.email === currentUser) {
      if (projectType === 'experiment') {
        dispatch(removeExperiment(project.id));
      } else {
        dispatch(removeSecondaryAnalysis(project.id));
      }
    }

    onCancel();
  }, [project, currentUser, projectType]);

  const okButtonText = addedUsers.length ? 'Add' : 'Done';
  const cancelButton = addedUsers.length ? (
    <Button onClick={() => setAddedUsers([])}>Cancel</Button>
  ) : null;

  const inviteUsers = async () => {
    if (!addedUsers.length) return;

    const response = await sendInvites(
      addedUsers,
      {
        id: project.id,
        name: project.name,
        role,
      },
    );

    if (role === 'owner' && response[0]?.data?.code === 200) {
      if (projectType === 'experiment') {
        dispatch(removeExperiment(project.id));
      } else {
        dispatch(removeSecondaryAnalysis(project.id));
      }
    }
    onCancel();
  };
  const explorerInfoText = projectType === 'experiment' ? `The user will be able to use Data Exploration and Plots and Tables modules,
              but will not be able to make any changes to samples or metadata in Insights or re-run the pipeline in the Data Processing module.`
    : `The user will be able to view the pipeline outputs, but not make any changes to the pipeline run.
     Any linked downstream analyses (related project in the Insights module) to this pipeline run needs to be  shared separately.`;

  const ownerInfoText = projectType === 'experiment' ? `There can be only one owner per project. The owner has full control over the project, data files,
      samples and metadata, as well as running Data Processing.`
    : 'There can be only one owner per run. The owner has full control over the run, data files, as well as running the Pipeline.';

  const infoText = role === 'explorer' ? explorerInfoText : ownerInfoText;

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
                  By assigning
                  {' '}
                  <b>{addedUsers[0]}</b>
                  {' '}
                  as owner, you will lose all access to this run/project.
                  <br />
                  Are you sure you want to continue with the transfer of ownership?
                </div>
              )}
              onConfirm={inviteUsers}
              okText='Yes'
              cancelText='No'
              disabled={addedUsers.length === 0}
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
        <PermissionsChecker
          experimentId={project.id}
          permissions={permissions.READ_USER_ACCESS}
          projectType={projectType}
        >
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
        </PermissionsChecker>

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
                        onClick={() => revokeAccess(user)}
                        disabled={user.email === currentUser && user.role === 'owner'}
                      >
                        {user.email === currentUser ? 'Leave' : 'Revoke'}
                      </Button>
                    </Col>
                  </Row>
                ))
              }
              <Row gutter={10} />
            </Card>
            <Text>
              <b>
                {role[0].toUpperCase() + role.slice(1)}
                :
                {' '}
              </b>
              {infoText}
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
  projectType: PropTypes.oneOf(['experiment', 'secondaryAnalysis']).isRequired,
};

export default ShareProjectModal;
