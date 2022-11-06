import { getData, setData } from './dataStore';
import {
  Empty, Error,
  UId, Token,
  ChannelId, DmId, MessageId,
  User, HandleStr, Name,
} from './interfaceTypes';
import { PrivateUser, Session, HashedToken } from './internalTypes';
import HTTPError from 'http-errors';


/**
 * Checks whether a uId exists in the database
 *
 * @param {UId} uId - Id of user.
 * @returns {boolean} boolean of whether user is valid
 */
export function validUserId(uId: UId): boolean {
  const data = getData();
  return data.users.some(user => user.uId === uId);
}

/**
 * Gets the value of a uId (not an object) from a given token.
 * @param {Token} token - token to get authUserId from
 * @returns {UId} uId - not an object.
 */
export function getUserIdFromToken(token: Token): UId {
  const data = getData();
  return data.sessions.find(s => hashCode(s.token + 'secret') === token).authUserId;
}

/**
 * Checks whether a token is valid (whether it exists in the sessions)
 *
 * @param {Token} token - Token to check
 * @returns {boolean} Boolean of whether the session is valid
 */
export function validToken(token: HashedToken): boolean {
  const data = getData();
  if (data.sessions.some(t => hashCode(t.token + 'secret') === token)) {
    return true;
  } else {
    throw HTTPError(403, 'Invalid token'); 
  }
}

/**
 * Checks whether a channel is valid (whether it exists in the database)
 *
 * @param {ChannelId} channelId - Id of channel.
 * @returns {boolean} boolean - whether channel is valid
 */
export function validChannelId(channelId : ChannelId) : boolean {
  const data = getData();
  return data.channels.some(channel => channel.channelId === channelId);
}

/**
 * Checks whether a user is in a channel
 *
 * @param {UId} uId - the user to check
 * @param {ChannelId} channelId - the channel the user may be contained in
 * @returns {boolean} boolean - true if user is in the channel
 */
export function userIsChannelMember(uId: UId, channelId : ChannelId) : boolean {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  return channel.allMembers.some(user => user.uId === uId);
}

/**
 * Checks whether a user owns a channel.
 * Does not account for global permissions.
 *
 * @param {UId} uId - the user to check
 * @param {ChannelId} channelId - the channel the user may be contained in
 * @returns {boolean} boolean - true if the user owns the channel
 */
export function userIsChannelOwner(uId: UId, channelId : ChannelId) : boolean {
  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  return channel.ownerMembers.some(user => user.uId === uId);
}

/**
 * Converts Private User to Public User
 *
 * @param {PrivateUser} user - to remove password from
 * @returns {User} User type - a user as in interface
 */
export function getPublicUser(user: PrivateUser): User {
  return {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  };
}

/**
 * Creates a session token for a user.
 *
 * @param {UId} uId - the user to assign the token to
 * @returns {Session} {token : string, authUserId: number} - the session object that was created.
 */
export function generateSession(uId: UId): Session {
  const tokenLength = 32;
  const session = {
    token: genRandomString(tokenLength),
    authUserId: uId,
  };

  const data = getData();

  data.sessions.push(session);
  setData(data);

  session.token = hashCode(session.token + 'secret');

  return session;
}

/**
 * 
 * @param {string} str - the string to be hashed
 * @returns {string} - the hashed version of the string
 */
export function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let x = 0; x < str.length; x++) {
    let ch = str.charCodeAt(x);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Creates a messageId.
 * Updates data. (You may need to call getData() again.)
 *
 * @returns {messageId : MessageId} {messageId : number} - the session object that was created.
 */
export function generateMessageId(): {messageId : MessageId} {
  const data = getData();
  const messageId = data.nextMessage;
  data.nextMessage++;
  setData(data);
  return {
    messageId: messageId,
  };
}

/**
 * Creates a new uId.
 * Updates data. (You may need to call getData() again.)
 *
 * @returns {uId : UId} {uId : UId} - the new uId that was created.
 */
export function generateUId(): {uId: UId} {
  const data = getData();
  const uId = data.nextUId;
  data.nextUId++;
  setData(data);
  return {
    uId: uId,
  };
}

/**
 * Returns whether or not a user is a global owner, given a uid
 * @param {UId} uId - the user to check
 * @return {boolean} boolean of whether user is global owner or not
 * @return {Error} {error: 'Invalid User'} if user does not exist
 */
export function isGlobalOwner(uId: UId): boolean | Error {
  if (!validUserId(uId)) return { error: 'Invalid User' };
  const data = getData();
  return data.users.find((user) => user.uId === uId).globalPermissions === 1;
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
 * @param {UId} uId - id of the the required user.
 * @returns {HandleStr} handleStr - users handle string.
 */
export function gethandleStrFromId(uId: UId): HandleStr {
  const data = getData();
  return data.users.find(s => s.uId === uId).handleStr;
}

/**
 * Checks whether a dm id is valid (whether it exists in the database)
 *
 * @param {DmId} dmId - Id of dm
 * @returns {boolean} boolean - whether dm id is valid
 */
export function validDmId(dmId: DmId): boolean {
  const data = getData();
  return data.dms.some(dm => dm.dmId === dmId);
}

/**
 * Checks whether a user is in a dm
 *
 * @param {UId} uId - the user to check
 * @param {DmId} dmId - the dm the user may be contained in
 * @returns {boolean} boolean - whether the user is in the dm
 */
export function checkUserIdtoDm(uId: UId, dmId: DmId): boolean {
  const data = getData();
  const position = data.dms.findIndex(dm => dm.dmId === dmId);
  return data.dms[position].members.some(user => user.uId === uId);
}

/**
 * Update users' information in all channels. ie. if a name changes, then update
 * that name in all channels
 *
 * @param {UId} uId - the users details to update.
 * @returns {Empty} {} - if successful
 * @returns {Error} {error: "uId invalid"} if user does not exist.
 */
export function updateUserDetails(uId: UId) : Empty | Error {
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };
  const data = getData();

  // Get updated user details
  const updatedUser = getPublicUser(data.users.find(user => user.uId === uId));

  // Update user details in each channel
  for (const channel of data.channels) {
    if (userIsChannelMember(uId, channel.channelId)) {
      const ownerIndex = channel.ownerMembers.findIndex((user) => user.uId === uId);
      channel.ownerMembers[ownerIndex] = updatedUser;
      const memberIndex = channel.allMembers.findIndex((user) => user.uId === uId);
      channel.allMembers[memberIndex] = updatedUser;
    }
  }

  // Update user details in each DM
  for (const dm of data.dms) {
    if (checkUserIdtoDm(uId, dm.dmId)) {
      if (dm.owner.uId === uId) dm.owner = updatedUser;
      const memberIndex = dm.members.findIndex((user) => user.uId === uId);
      dm.members[memberIndex] = updatedUser;
    }
  }

  setData(data);
  return {};
}

/** Generates a unique handle for a user
 *
 * @param {Name} nameFirst - first name of the user
 * @param {Name} nameLast - last name of the user
 *
 * @returns {HandleStr} handleStr - generated handle for user
 */
export function generateHandleStr(nameFirst: Name, nameLast: Name): HandleStr {
  let handleStr = nameFirst + nameLast;
  handleStr = handleStr.toLowerCase();
  handleStr = handleStr.replace(/[^a-z0-9]/gi, '');
  if (handleStr.length > 20) {
    handleStr = handleStr.substring(0, 20);
  }
  let num = 0;
  let handleStringExists = false;
  const data = getData();
  for (const user of data.users) {
    if (handleStr === user.handleStr) {
      num = 0;
      handleStringExists = true;
    } else if ((handleStr === user.handleStr.substring(0, handleStr.length)) && /^\d$/.test(user.handleStr[user.handleStr.length - 1])) {
      num++;
    }
  }
  if (handleStringExists) {
    handleStr += num;
  }

  return handleStr;
}

/**
 * Checks if a message is in a channel
 *
 * @param messageId - the id of the message to be checked
 * @returns number - returns the index of the channel if present or -1 if not
 */
export function checkMessageToChannel(messageId : number) : number {
  const data = getData();
  for (let channel = 0; channel < data.channels.length; channel++) {
    for (const message of data.channels[channel].messages) {
      if (message.messageId === messageId) {
        return channel;
      }
    }
  }
  return -1;
}

/**
 * Checks if a message is in a dm
 *
 * @param messageId - the id of the message to be checked
 * @returns number - returns the index of the dm if present or -1 if not
 */
export function checkMessageToDm(messageId : number) : number {
  const data = getData();
  for (let dm = 0; dm < data.dms.length; dm++) {
    for (const message of data.dms[dm].messages) {
      if (message.messageId === messageId) {
        return dm;
      }
    }
  }
  return -1;
}

/**
 * Checks whether a user has permission to affect a message
 *
 * @param authUserId - the user to check
 * @param messageId - the id of the message to be checked
 * @returns boolean - whether the user has access to change the message
 */
export function checkUserToMessage(authUserId : number, messageId : number) : boolean {
  const data = getData();
  const checkChannel = checkMessageToChannel(messageId);
  if (checkChannel === -1) {
    const checkDm = checkMessageToDm(messageId);
    if (checkDm === -1) {
      return false;
    } else {
      const dmPosition = data.dms[checkDm].messages.findIndex(message => message.messageId === messageId);
      if (data.dms[checkDm].messages[dmPosition].uId === authUserId) {
        return true;
      } else {
        if (data.dms[checkDm].owner.uId === authUserId) {
          return true;
        } else {
          return false;
        }
      }
    }
  } else {
    const position = data.channels[checkChannel].messages.findIndex(message => message.messageId === messageId);
    if (data.channels[checkChannel].messages[position].uId === authUserId) {
      return true;
    } else {
      for (const member of data.channels[checkChannel].ownerMembers) {
        if (member.uId === authUserId) {
          return true;
        }
      }
      return false;
    }
  }
}

/**
 * Checks whether a message id is valid
 *
 * @param messageId - the id of the message to be checked
 * @returns boolean - whether the message id is valid or not
 */
export function validMessageId(messageId : number) : boolean {
  if (!checkMessageToChannel(messageId) && !checkMessageToDm(messageId)) {
    return false;
  } else {
    return true;
  }
}

/**
 * Checks whether a member has owner permsissions within a channel
 *
 * @param authUserId - the user to check
 * @param channelId - the channel to be checked
 *
 * @returns boolean - whether the user has owner permissions or not
 */
export function checkChannelOwner(authUserId: number, channelId: number) {
  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  for (let i = 0; i < data.channels[channelIndex].ownerMembers.length; i++) {
    if (authUserId === data.channels[channelIndex].ownerMembers[i].uId) {
      return true;
    }
  }
  return false;
}
