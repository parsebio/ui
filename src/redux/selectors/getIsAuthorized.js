import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';

const accessRoles = {
  OWNER: 'owner',
  EXPLORER: 'explorer',
  VIEWER: 'viewer',
  ADMIN: 'admin',
};

const permissions = {
  WRITE: 'write',
};

const permissionsByRole = {
  [accessRoles.OWNER]: new Set([permissions.WRITE]),
  [accessRoles.EXPLORER]: new Set([permissions.WRITE]),
  [accessRoles.VIEWER]: new Set([]),
  [accessRoles.ADMIN]: new Set([permissions.WRITE]),
};

const getIsAuthorized = (experimentId, category) => (state) => {
  const role = experimentId
    ? state.experiments[experimentId].accessRole
    : state.experimentSettings.info.accessRole;

  return permissionsByRole[role].has(category);
};

export default createMemoizedSelector(getIsAuthorized);
