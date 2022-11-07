import { getData, setData } from './dataStore';
import { Token, Name, IsPublic, ChannelId } from './interfaceTypes';
import { PrivateChannel, ChannelsObj } from './internalTypes';
import HTTPError from 'http-errors';

import {
  validToken,
  userIsChannelMember,
  getPublicUser,
  getUserIdFromToken,
} from './helper';

/**
  * Lists all channels that currently exists. Returns an error if authUserID isn't an authorised user
  *
  * @param {Token} token - The token of the person calling channelsListAll
  *
  * @returns {Error} {error: 'Invalid Session Id.'} - If the user token is invalid
  * @returns {ChannelsObj} { channels: [...] } - Object containing array of channels If the user calling the function is authorised and if there are currently any existing channels
  * @returns {ChannelsObj} { channels: [] } - If no channels have been created
  *
*/
export function channelsListAllV3 (token: Token): ChannelsObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session Id.');
  const data = getData();
  const channelList = [];
  for (const channel of data.channels) {
    channelList.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }

  return { channels: channelList };
}

/**
  * Lists the channels that given user is a member of. Returns an error if the user is invalid.
  *
  * @param {Token} token - Token of the user who is using channels/list
  *
  * @returns {Error} {error: 'Invalid Session Id.'} - If the token is invalid.
  * @returns {ChannelsObj} { channels: [...] } - If the user calling the function is authorised and has joined a channel/s
 * @returns {ChannelsObj} {channels: []} - If the user has not joined any channels
 *
*/
export function channelsListV3(token: Token): ChannelsObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session Id.');
  const data = getData();
  const channelList = [];
  for (const channel of data.channels) {
    if (userIsChannelMember(getUserIdFromToken(token), channel.channelId)) {
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
  * @param {Token} token - the channel creator's user ID
  * @param {Name} name - the new channel's name
  * @param {IsPublic} isPublic - whether the new channel should be public or private
  *
  * @returns {{channelId: ChannelId}} {channelId: ChannelId} - if channel creation is successfull
  * @returns {Error} {error: 'Invalid user permissions.'} - If user is not a valid user
  * @returns {Error} {error: 'Channel name must be between 1-20 characters.'} - If channel name is too long/short
*/
export function channelsCreateV3(token: Token, name: Name, isPublic: IsPublic): { channelId: ChannelId } {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session Id.');
  if (name.length < 1 || name.length > 20) throw HTTPError(400, 'Channel name must be between 1-20 characters.');

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  let newChannelId = 0;
  while (data.channels.some(c => c.channelId === newChannelId)) newChannelId++;
  const newChannel: PrivateChannel = {
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
  const privateUser = getPublicUser(data.users[userIndex]);

  data.channels[channelIndex].ownerMembers.push(privateUser);
  data.channels[channelIndex].allMembers.push(privateUser);

  setData(data);

  return { channelId: newChannel.channelId };
}
