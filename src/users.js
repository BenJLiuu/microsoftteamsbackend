import { getData } from './dataStore.js';

export function validUserId(authUserId) {
  const data = getData();
  return data.users.some(user => user.uId === authUserId);
}

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
export function userProfileV1 (authUserId, uId) {
  const data = getData();

  if (Boolean(data.users.find(user => user.uId === authUserId)) === false) {
    return { error: 'authUserId is invalid.' }
  }

  if (Boolean(data.users.find(user => user.uId === uId)) === false) {
    return { error: 'uId does not refer to a valid user.' }
  }

  const user = data.users.find(user => user.uId === uId);
  
  const userNoPass = {
    uId: user.uId,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    email: user.email,
    handleStr: user.handleStr,
  }

  return { user: userNoPass };
}

export function validChannelId(channelId) {
  const data = getData();
  return data.channels.some(channel => channel.channelId === channelId);
}

export function checkUserIdtoChannel(authUserId, channelId) {
  const data = getData();
  let position = 0;
  for (let i = 0; i < data.channels.length; i++) {
      if (data.channels[i].channelId === channelId) {
        position = i;
      }
  }
  return data.channels[position].allMembers.some(user => user.uId === authUserId);
}

export function removePassword(user) {
  return {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  };
}