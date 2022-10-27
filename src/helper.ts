import { getData, setData } from './dataStore';
import { User, PrivateUser, Session, messageId } from './objects';

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
  const position = data.channels.findIndex(channel => channel.channelId === channelId);
  return data.channels[position].allMembers.some(user => user.uId === authUserId);
}

/**
 * Removes password parameter from user object
 *
 * @param user - to remove password from
 * @returns {PrivateUser} {
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
 * @returns {Session} {token : string, authUserId: number} - the session object that was created.
 */
export function generateSession(uId: number): Session {
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
 * Creates a messageId.
 *
 * @returns {Object} {messageId : number} - the session object that was created.
 */
export function generateMessageId(): messageId {
  const data = getData();
  const messageId = data.nextMessage;
  data.nextMessage++;
  setData(data);
  return {
    messageId: messageId
  };
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

/**
 * Gets the handle string of a user from a given user id.
 * @param {number} uId - id of the the required user.
 * @returns {string} handleStr - users handle string.
 */
export function gethandleStrFromId(uId: number): string {
  const data = getData();
  return data.users.find(s => s.uId === uId).handleStr;
}

/**
 * Checks whether a dm id is valid (whether it exists in the database)
 *
 * @param dmId - Id of dm
 * @returns boolean - whether dm id is valid
 */
export function validDmId(dmId : number) : boolean {
  const data = getData();
  return data.dms.some(dm => dm.dmId === dmId);
}

/**
 * Checks whether a user is in a dm
 *
 * @param authUserId - the user to check
 * @param dmId - the dm the user may be contained in
 * @returns boolean - whether the user is in the dm
 */
export function checkUserIdtoDm(authUserId : number, dmId : number) : boolean {
  const data = getData();
  const position = data.dms.findIndex(dm => dm.dmId === dmId);
  return data.dms[position].members.some(user => user.uId === authUserId);
}
