import { getData, setData } from './dataStore.js';
import { validUserId, checkUserIdtoChannel, removePassword } from './users.js';

/**
  * Lists all channels that currently exists. Returns an error if authUserID isn't an authorised user
  * 
  * @param {integer} authUserId - The user ID of the person calling the function
  * 
  * @returns {error: 'Invalid Authorised User Id.'} - If the person calling the function is not an authorised user
  * @returns {
  *   channelId: integer,
  *   name: string
  * } - If the user calling the function is authorised and if there are currently any existing channels
  * @returns {channels: []} - No channels have been created
  * 
*/

function channelsListAllV1 (authUserId) {
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    }
  } 
  const data = getData();
  const channel_list = [];
  for (let i of data.channels) {
    channel_list.push({
      channelId: i.channelId,
      name: i.name
    });
  }

  return { channels: channel_list };
}

/**
  * Lists the channels that given userId is a member of. Returns an error if authUserID isn't an authorised user
  * 
  * @param {integer} authUserId - The user ID of the person calling the function
  * 
  * @returns {error: 'Invalid Authorised User Id.'} - If the person calling the function is not an authorised user
  * @returns {
 *   channelId: integer,
 *   name: string
 * } - If the user calling the function is authorised and has joined a channel/s
 * @returns {channels: []} - The user has not joined any channels
 * 
*/

function channelsListV1(authUserId) {
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    }
  } 
  const data = getData();
  const channel_list = [];
  for (let i of data.channels) {
    if (checkUserIdtoChannel(authUserId, i.channelId)) {
      channel_list.push({
        channelId: i.channelId,
        name: i.name
      });
    }
  }

  return { channels: channel_list };
}

/**
  * Creates a channel as requested by a user, and returns the new channels' id.
  * Assigns the user that created the channel as the owner of that channel,
  * as well as making them a normal member.
  *
  * @param {integer} authUserId - the channel creator's user ID
  * @param {string} name - the new channel's name
  * @param {boolean} isPublic - whether the new channel should be public or private
  *
  * @returns {channelId: integer} - if channel creation is successfull
  * @returns {error: 'Invalid user permissions.'} - If user is not a valid user
  * @returns {error: 'Channel name must be between 1-20 characters.'} - If channel name is too long/short
*/
function channelsCreateV1(authUserId, name, isPublic ) {
  if (!validUserId(authUserId)) return {
    error: "Invalid user permissions.",
  };
  if (name.length < 1 || name.length > 20) return {
    error: "Channel name must be between 1-20 characters.",
  };

  const data = getData();
  const newChannelId = Math.floor(Math.random() * 899999 + 100000);

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

export { channelsCreateV1, channelsListAllV1, channelsListV1 };
