import { getData, setData } from './dataStore';
import { Empty, Token, UId } from './interfaceTypes';
import { Permission } from './internalTypes';
import HTTPError from 'http-errors';

import { validToken, validUserId } from './helper';

/**
 * Given a user by their uID, sets their permissions to new permissions described by permissionId.
 * @param token - token of user calling function
 * @param uId - uId of user to update
 * @param permissionId - permissionId - permission to grant
 * @returns {Empty} Empty object if no error.
 */
export function adminUserPermissionChange (token: Token, uId: UId, permissionId: Permission): Empty {
  const GLOBALOWNER = 1;
  const GLOBALMEMBER = 2;
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (!validUserId(uId)) throw HTTPError(400, 'Invalid User Id.');
  if (permissionId !== 1 && permissionId !== 2) throw HTTPError(400, 'Invalid Permission Id.');
  const data = getData();
  const globalCount = data.users.filter(user => user.globalPermissions === GLOBALOWNER).length;
  const userIndex = data.users.findIndex(user => user.uId === uId);

  const isOnlyGlobalOwner = globalCount === 1 && data.users[userIndex].globalPermissions;
  if (isOnlyGlobalOwner && permissionId === GLOBALMEMBER) throw HTTPError(400, 'Cannot demote only global owner to global member.');
  if (data.users[userIndex].globalPermissions === permissionId) throw HTTPError(400, 'User already has this permission.');

  data.users[userIndex].globalPermissions = permissionId;
  setData(data);
  return {};
}
