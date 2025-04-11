import createMemoizedSelector from 'redux/selectors/createMemoizedSelector';
import { permissions } from 'utils/constants';

const accessRoles = {
  OWNER: 'owner',
  EXPLORER: 'explorer',
  VIEWER: 'viewer',
  ADMIN: 'admin',
};

const permissionsByRole = {
  [accessRoles.OWNER]: new Set([permissions.WRITE, permissions.READ_USER_ACCESS]),
  [accessRoles.EXPLORER]: new Set([permissions.WRITE, permissions.READ_USER_ACCESS]),
  [accessRoles.VIEWER]: new Set([]),
  [accessRoles.ADMIN]: new Set([permissions.WRITE, permissions.READ_USER_ACCESS]),
};

const getHasPermissions = (experimentId, permissionsToCheck) => (state) => {
  const role = experimentId
    ? state.experiments[experimentId].accessRole
    : state.experimentSettings.info.accessRole;

  return permissionsByRole[role].has(permissionsToCheck);
};

export default createMemoizedSelector(getHasPermissions);
