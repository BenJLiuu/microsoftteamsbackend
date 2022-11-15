import { getData } from './dataStore';
import { Users, Token } from './interfaceTypes';
import { WorkplaceStatsObj } from './internalTypes';
import { validToken, getPublicUser } from './helper';
import HTTPError from 'http-errors';

/**
 * Provides the array of all users within the dataStore.
 *
 * @param {Token} token - Token of user requesting the usersAll.
 * @returns {Users} {users: [...]} - All users, with passwords removed.
 * @returns {Error} { error: 'Invalid Session Id.' } if token is invalid
 */
export function usersAllV2 (token: Token): {users: Users} {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const data = getData();
  const users = [];
  for (const user of data.users) {
    users.push(getPublicUser(user));
  }

  return {
    users: users,
  };
}

/**
 * Gets the workspaces' stats, including channel/dm/message info, and utilization rate.
 * @param {Token} token the user requesting their stats
 * @throws 403 - Invalid token, if user does not exist.
 * @returns {WorkplaceStatsObj} the workplace stats, contained within an object.
 */
 export function usersStatsV1 (token: Token): WorkplaceStatsObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const uId = getUserIdFromToken(token);
  const data = getData();

  return {
    workspaceStats: data.workspaceStats.history,
  };
}