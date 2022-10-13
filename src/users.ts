import { getData } from './dataStore';
import { User, UserOmitPassword, PrivateUser, Error } from './objects';
import { removePassword } from './helper'

/**
  * For a valid user, returns information about a requested valid user profile
  *
  * @param {integer} authUserId - Id of user sending the request to view the profile.
  * @param {integer} uId - Id of user, whose profile is to be viewed.
  *
  * @returns {error: 'authUserId is invalid.'} - authUserId does not correspond to an existing user.
  * @returns {error: 'uId does not refer to a valid user.'}  - uId does not correspond to an existing user.
  * @returns {
  *   uId: integer,
  *   nameFirst: string,
  *   nameLast: string,
  *   email: string,
  *   handleStr: string
  * } - Users verified and user profile is returned.
*/
export function userProfileV1 (authUserId: number, uId: number): UserOmitPassword | Error {
  const data = getData();

  if (Boolean(data.users.find(user => user.uId === authUserId)) === false) {
    return { error: 'authUserId is invalid.' };
  }

  if (Boolean(data.users.find(user => user.uId === uId)) === false) {
    return { error: 'uId does not refer to a valid user.' };
  }

  const user = data.users.find(user => user.uId === uId);
  const privateUser = removePassword(user);

  return { user: privateUser } as UserOmitPassword;
}
