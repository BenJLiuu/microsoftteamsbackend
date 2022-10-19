import { getData, setData } from './dataStore';
import { Channels, ChannelId, Error } from './objects';

import {
  validUserId,
  validToken,
  checkUserIdtoChannel,
  removePassword,
  getUserIdFromToken,
} from './helper';

/**
  * Lists all channels that currently exists. Returns an error if authUserID isn't an authorised user
  *
  * @param {integer} authUserId - The user ID of the person calling the function
  *
  * @returns {Object} {error: 'Invalid Authorised User Id.'} - If the person calling the function is not an authorised user
  * @returns {
  *   channelId: integer,
  *   name: string
  * } - If the user calling the function is authorised and if there are currently any existing channels
  * @returns {channels: []} - No channels have been created
  *
*/
function channelsListAllV1 (authUserId: number): Channels | Error {
  /*if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    };
  }
  */
  const data = getData();
  const channelList = [];
  for (const i of data.channels) {
    channelList.push({
      channelId: i.channelId,
      name: i.name
    });
  }

  return { channels: channelList };
}

/**
  * Lists the channels that given user is a member of. Returns an error if the user is invalid.
  *
  * @param {string} token - Token of the user who is using channels/list
  *
  * @returns {Object} {error: 'Invalid Session Id.'} - If the token is invalid.
  * @returns {Object} {
 *   channelId: integer,
 *   name: string
 * } - If the user calling the function is authorised and has joined a channel/s
 * @returns {Object} {channels: []} - If the user has not joined any channels
 *
*/

function channelsListV2(token: string): Channels | Error {

  if (!validToken(token)) return { error: 'Invalid Session Id.' };
  const data = getData();
  const channelList = [];
  for (const channel of data.channels) {
    if (checkUserIdtoChannel(getUserIdFromToken(token), channel.channelId)) {
      channelList.push({
        channelId: channel.channelId,
        name: channel.name
      });
    }
  }

  return { channels: channelList };
}

/**
  * Creates a channel as requested by a user, and returns the new channels' id.
  * Assigns the user that created the channel as the owner of that channel,
  * as well as making them a normal member.
  *
  * @param {string} token - the channel creator's user ID
  * @param {string} name - the new channel's name
  * @param {boolean} isPublic - whether the new channel should be public or private
  *
  * @returns {Object} {channelId: integer} - if channel creation is successfull
  * @returns {Object} {error: 'Invalid user permissions.'} - If user is not a valid user
  * @returns {Object} {error: 'Channel name must be between 1-20 characters.'} - If channel name is too long/short
*/
function channelsCreateV2(token: string, name: string, isPublic: boolean): ChannelId | Error {
  if (!validToken(token)) return { error: 'Invalid Session Id.' };
  if (name.length < 1 || name.length > 20) return { error: 'Channel name must be between 1-20 characters.' };

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  let newChannelId = 0;
  while (data.channels.some(c => c.channelId === newChannelId)) newChannelId++;
  const newChannel = {
    channelId: newChannelId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [],
    allMembers: [],
    messages: [],
  };

  data.channels.push(newChannel);
  const userIndex = data.users.findIndex(user => user.uId === authUserId);
  const channelIndex = data.channels.findIndex(channel => channel.channelId === newChannelId);
  const privateUser = removePassword(data.users[userIndex]);

  data.channels[channelIndex].ownerMembers.push(privateUser);
  data.channels[channelIndex].allMembers.push(privateUser);

  setData(data);

  return { channelId: newChannel.channelId };
}

export { channelsCreateV2, channelsListAllV1, channelsListV2 };
