import { getData, setData } from './dataStore';
import { User, PrivateUser } from './objects';

/**
 * Checks whether a user is valid (whether they exist in the database)
 *
 * @param authUserId - Id of user.
 * @returns boolean of whether user is valid
 */
export function validUserId(authUserId : number) : boolean {
  const data = getData();
  return data.users.some(user => user.uId === authUserId);
}

/**
 * Gets the value of a uId (not an object) from a given token.
 * @param {string} token - token to get authUserId from
 * @returns {number} authUserId - not an object.
 */
export function getUserIdFromToken(token: string): number {
  const data = getData();
  return data.sessions.find(s => s.token === token).authUserId;
}

/**
 * Checks whether a token is valid (whether it exists in the sessions)
 *
 * @param {string} token - Token to check
 * @returns {boolean} Boolean of whether the session is valid
 */
export function validToken(token: string): boolean {
  const data = getData();
  return data.sessions.some(t => t.token === token);
}

/**
 * Checks whether a channel is valid (whether it exists in the database)
 *
 * @param channelId - Id of channel.
 * @returns boolean - whether channel is valid
 */
export function validChannelId(channelId : number) : boolean {
  const data = getData();
  return data.channels.some(channel => channel.channelId === channelId);
}

/**
 * Checks whether a user is in a channel
 *
 * @param authUserId - the user to check
 * @param channelId - the channel the user may be contained in
 * @returns boolean - whether the user is in the channel
 */
export function checkUserIdtoChannel(authUserId : number, channelId : number) : boolean {
  const data = getData();
  let position = 0;
  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) {
      position = i;
    }
  }
  return data.channels[position].allMembers.some(user => user.uId === authUserId);
}

/**
 * Removes password parameter from user object
 *
 * @param user - to remove password from
 * @returns {
 *   uId: integer,
 *   nameFirst: string,
 *   nameLast: string,
 *   email: string,
 *   handleStr: string
 * } - a user but without the password key
 */
export function removePassword(user : User) : PrivateUser {
  const copy = { ...user };
  delete copy.passwordHash;
  return copy;
}

/**
 * Creates a session token for a user.
 *
 * @param {integer} uId - the user to assign the token to
 * @returns {LoginData} {token : string, authUserId: number} - the session object that was created.
 */
export function generateSession(uId: number): string {
  const tokenLength = 32;
  const session = {
    token: genRandomString(tokenLength),
    authUserId: uId,
  };

  const data = getData();

  data.sessions.push(session);
  setData(data);
  return session;
}

/**
 * Generates a random string.
 * From https://tecadmin.net/generate-random-string-in-javascript/
 * @param {integer} length - how long of a string to generate.
 * @returns {string} string - random string
 */
function genRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  const charLength = chars.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}
