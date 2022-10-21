import { getData } from './dataStore';
import { UserOmitPassword, Error } from './objects';
import { removePassword } from './helper';

/**
  * For a valid user, returns information about a requested valid user profile
  *
  * @param {integer} authUserId - Id of user sending the request to view the profile.
  * @param {integer} uId - Id of user, whose profile is to be viewed.
  *
  * @returns {Object} {error: 'authUserId is invalid.'} - authUserId does not correspond to an existing user.
  * @returns {Object} {error: 'uId does not refer to a valid user.'}  - uId does not correspond to an existing user.
  * @returns {UserOmitPassword} User profile, without password key.
*/
export function userProfileV1 (authUserId: number, uId: number): UserOmitPassword | Error {
  const data = getData();

  if (!(data.users.some(user => user.uId === authUserId))) {
    return { error: 'authUserId is invalid.' };
  }

  if (!(data.users.find(user => user.uId === uId))) {
    return { error: 'uId does not refer to a valid user.' };
  }

  const user = data.users.find(user => user.uId === uId);
  const privateUser = removePassword(user);

  return { user: privateUser };
}

/**
 * Provides the array of all users within the dataStore.
 * 
 * @param {string} token - Token of user requesting the usersAll.
 * @returns {PrivateUser[]} All users, with passwords removed.
 */
export function usersAllV1 (token: string): PrivateUser[] | Error {
  if (!validToken(token)) return { error: 'Invalid Session Id.' };
  const data = getData();
  const users = [];
  for (const user of data.users) {
    users.push(removePassword(user));
  };

  return {
    users: users,
  };
}