import { getData, setData } from './dataStore';
import { Empty, Token, UId } from './interfaceTypes';
import { Permission } from './internalTypes';
import HTTPError from 'http-errors';

import {
  validToken, validUserId,
  isGlobalOwner, getUserIdFromToken
} from './helper';

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
  if (!isGlobalOwner(getUserIdFromToken(token))) throw HTTPError(403, 'User does not have required privledges to perform action.');
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

/**
 * Removes a user. They are removed from all channels/DMs, and are not included in the array of users returned by users/all.
 * Global owners can remove other Global owners (including the original first owner).
 * Once a user is removed, the contents of the messages they sent will be replaced by 'Removed user'.
 * Their profile is still be retrievable with user/profile, but nameFirst is 'Removed' and nameLast is 'user'.
 * The user's email and handle are reusable.
 * @param token - the token of the global owner requesting user removal
 * @param uId - the uid of the user to remove
 */
export function adminUserRemove (token: Token, uId: UId): Empty {
  const GLOBALOWNER = 1;
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (!isGlobalOwner(getUserIdFromToken(token))) throw HTTPError(403, 'User does not have required privledges to perform action.');
  if (!validUserId(uId)) throw HTTPError(400, 'Invalid User Id.');

  // User is a valid user. Update details in user so that email and handle can be reused
  const data = getData();
  const userIndex = data.users.findIndex(user => user.uId === uId);
  const globalCount = data.users.filter(user => user.globalPermissions === GLOBALOWNER).length;

  if (globalCount === 1 && data.users[userIndex].globalPermissions === GLOBALOWNER) throw HTTPError(400, 'Cannot remove only global owner.');
  data.users[userIndex] = {
    uId: uId,
    nameFirst: 'Removed',
    nameLast: 'user',
    email: '',
    handleStr: '',
    passwordHash: null,
    globalPermissions: null,
    notifications: [],
    resetCode: '',
    userStats: null
  };

  // Replace all messages. Probably doesn't work so FIXME:
  data.channels.forEach(channel => channel.messages.forEach((message) => {
    if (message.uId === uId) message.message = 'Removed user';
  }));
  data.dms.forEach(dm => dm.messages.forEach((message) => {
    if (message.uId === uId) message.message = 'Removed user';
  }));

  // Remove user from all channels.
  for (const channel in data.channels) {
    for (const member in data.channels[channel].allMembers) {
      if (data.channels[channel].allMembers[member].uId === uId) {
        data.channels[channel].allMembers.splice(parseInt(member), 1);
      }
    }
    for (const ownerMember in data.channels[channel].ownerMembers) {
      if (data.channels[channel].ownerMembers[ownerMember].uId === uId) {
        data.channels[channel].ownerMembers.splice(parseInt(ownerMember), 1);
      }
    }
  }

  // Remove user from all dms.
  for (const dm in data.dms) {
    for (const member in data.dms[dm].members) {
      if (data.dms[dm].members[member].uId === uId) {
        data.dms[dm].members.splice(parseInt(member), 1);
      }
    }
  }

  setData(data);
  return {};
}
