import { getData, setData } from './dataStore';
import { validUserId, validChannelId, checkUserIdtoChannel, removePassword, validToken, getUserIdFromToken } from './helper';
import { Error, MessageList, ChannelDetails } from './objects';

/**
  * Returns an object containing all messages sent from a certain start point in
  * a given channel, stopping at either 50 total messages or
  *
  * @param {integer} authUserId - The Id of the user attempting to see messages.
  * @param {integer} channelId - The Id of the channel which messages are being returned.
  * @param {integer} start - The number of messages from the most recent to begin returning messages.
  *
  * @returns MessageList - Object containing start offset, end offset, and array of message objects.
  * @returns {Error} {error : 'Not valid channelId'} - If channelId was not found.
  * @returns {Error} {error : 'Invalid Authorised User Id'} - If authUserId was not found.
  * @returns {Error} {error : 'Start is greater than total messages'} - If start offset is greater than total messages in channel.
  * @returns {Error} {error : 'Authorised user is not a channel member'} - authUserId is not in channel allMembers array.
*/
export function channelMessagesV1(authUserId: number, channelId: number, start: number): MessageList | Error {
  if (!validChannelId(channelId)) return { error: 'Not valid channelId' };
  if (!validUserId(authUserId)) return { error: 'Invalid Authorised User Id.' };

  const data = getData();
  const index = data.channels.findIndex(channel => channel.channelId === channelId);
  if (start > data.channels[index].messages.length) return { error: 'Start is greater than total messages' };

  const isChannelMember = data.channels[index].allMembers.some(users => users.uId === authUserId);
  if (!isChannelMember) return { error: 'Authorised user is not a channel member' };

  let end = 0;
  if (data.channels[index].messages.length + start > 50) {
    end = start + 50;
  } else {
    if (data.channels[index].messages.length !== 0) {
      end -= 1;
    }
  }

  const messagesArray = [];
  for (let i = start; i < end - start; i++) {
    messagesArray.push(data.channels[index].messages[i]);
  }

  messagesArray.sort(function(a, b) {
    return a.timeSent - b.timeSent;
  });

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}

/**
  * Helper function intended to implement message sending for the sake of future
  * iterations of channel messages. If uncommented along with the white-box tests
  * in channel.test.js, will pass. Will be redone in a black-box fashion in a
  * future iteration.
  *
*/
/*
export function channelSendMessageV1 (authUserId, channelId, message) {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' }
  if (!validUserId(authUserId)) return { error: 'Invalid Authorised User Id.' };

  const data = getData();
  const index = data.channels.findIndex(channel => channel.channelId === channelId);
  const messageId = Math.floor(Math.random() * 899999 + 100000);
  const messageTime = new Date().getTime();

  const newMessage = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: messageTime,
  }

  data.channels[index].messages.push(newMessage);
  setData(data);
  return { messageId: messageId };
}
*/

/**
  * Sends a user specific invite to a given channel
  *
  * @param {string} token - Token of user sending the invite.
  * @param {integer} channelId - Id of channel user is being invited to.
  * @param {integer} uId - Id of user to be invited.
  *
  * @returns {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {error: 'Invalid User Id.'}  - uId does not correspond to an existing user.
  * @returns {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {error: 'User is already a member.'} - uId corresponds to user already in channel.
  * @returns {error: 'Authorised User is not a member.'} - authUserId does not correspond to a user in channel allMembers array.
  * @returns {} - uId has been succesfully invited to corresponding channel.
*/
export function channelInviteV2(token: string, channelId: number, uId: number): Record<string, never> | Error {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };
  if (checkUserIdtoChannel(uId, channelId)) return { error: 'User is already a member.' };
  if (!checkUserIdtoChannel(getUserIdFromToken(token), channelId)) return { error: 'Authorised User is not a member.' };

  const data = getData();

  const userIndex = data.users.findIndex(user => user.uId === uId);
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  const privateUser = removePassword(data.users[userIndex]);
  data.channels[channelIndex].allMembers.push(privateUser);

  setData(data);
  return {};
}

/**
  * Provides the details of the owners and members of a given channel.
  *
  * @param {integer} authUserId - Id of user sending the invite.
  * @param {integer} channelId - Id of channel user is being invited to.
  *
  * @returns {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {error: 'Invalid Authorised User Id.'} - authUserId does not correspond to an existing user.
  * @returns {error: 'Authorised User is not a member.'} - authUserId does not correspond to a user in channel allMembers array.
  * @returns ChannelDetails - Object containing channel successfully examined by authUserId.
*/
export function channelDetailsV1(authUserId: number, channelId: number): ChannelDetails | Error {
  if (!validChannelId(channelId)) return { error: 'Invalid Channel Id.' };
  if (!validUserId(authUserId)) return { error: 'Invalid Authorised User Id.' };
  if (!checkUserIdtoChannel(authUserId, channelId)) return { error: 'Authorised User is not a member.' };

  const data = getData();

  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);

  setData(data);
  return {
    name: data.channels[channelIndex].name,
    isPublic: data.channels[channelIndex].isPublic,
    ownerMembers: data.channels[channelIndex].ownerMembers,
    allMembers: data.channels[channelIndex].allMembers,
  };
}

/**
  * Allows a user to attempt to join a channel.
  *
  * @param {string} token - Token of user sending the invite.
  * @param {integer} channelId - Id of channel user is being invited to.
  *
  * @returns {error: 'Invalid Channel Id.'} - Channel does not exist.
  * @returns {error: 'Invalid Token.'} - Token does not correspond to an existing user.
  * @returns {error: 'You are already a member.'} - authUserId corresponds to user already in channel.
  * @returns {error: 'You do not have access to this channel.'} - Channel is private.
  * @returns {} - authUserId successfully joins the specified channel.
  *
*/
export function channelJoinV2(token: string, channelId: number): Record<string, never> | Error {
  const data = getData();

  if (!data.channels.some(channel => channel.channelId === channelId)) return { error: 'Invalid Channel Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const channelIndex = data.channels.map(object => object.channelId).indexOf(channelId);
  const userIndex = data.users.findIndex(user => user.uId === getUserIdFromToken(token));
  const privateUser = removePassword(data.users[userIndex]);

  if (data.channels[channelIndex].allMembers.some(user => user.uId === getUserIdFromToken(token))) return { error: 'You are already a member.' };

  if (data.channels[channelIndex].isPublic === false &&
      data.channels[channelIndex].allMembers.includes(privateUser) === false &&
      data.users[0].uId !== getUserIdFromToken(token)) {
    return { error: 'You do not have access to this channel.' };
  }

  data.channels[channelIndex].allMembers.push(privateUser);
  setData(data);

  return {};
}
