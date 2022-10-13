import { getData } from './dataStore';
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
  return {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  };
}
