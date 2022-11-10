import { getData, setData } from './dataStore';
import { Token, DmId, ChannelId, Message, Empty } from './interfaceTypes';
import { MessageIdObj } from './internalTypes';
import {
  validChannelId,
  validToken,
  getUserIdFromToken,
  validDmId,
  checkUserIdtoDm,
  userIsChannelMember,
  generateMessageId,
  checkMessageToChannel,
  checkMessageToDm,
  checkUserToMessage,
  validMessageId,
  checkTag,
} from './helper';
import HTTPError from 'http-errors';

/**
 * Send and store a DM sent by a given user
 *
 * @param {Token} token - the session id of the sender
 * @param {DmId} dmId - the dm the message was sent in
 * @param {Message} message - the message to be sent
 *
 * @returns {Error} {error: 'Invalid Dm Id.'} - Dm does not exist.
 * @returns {Error} {error: 'Message contains too little characters.'} - Message has less than 1 character.
 * @returns {Error} {error: 'Message contains too many characters.'} - Message has more than 1000 characters.
 * @returns {Error} {error: 'Invalid Token.'} - Token does not correspond to an existing user.
 * @returns {Error} {error: 'Authorised user is not a member of the Dm.'} - The authUserId corresponds to user that is not a member of the Dm.
 * @returns {messageId} messageId - the Id of the stored message
 */
export function messageSendDmV2(token: Token, dmId: DmId, message: Message): MessageIdObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session');
  if (!validDmId(dmId)) throw HTTPError(400, 'Invalid Dm Id');
  if (message.length < 1) throw HTTPError(400, 'Message contains too little characters.');
  if (message.length > 1000) throw HTTPError(400, 'Message contains too many characters.');
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) throw HTTPError(400, 'Authorised user is not a member of the Dm');

  const messageId = generateMessageId().messageId;
  const data = getData();
  // Add message to DM list
  data.dms.find(dm => dm.dmId === dmId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
  });

  const usersTagged = checkTag(message);
  const ownerIndex = data.users.findIndex(user => user.uId === authUserId);
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  if (usersTagged.amountTagged !== 0) {
    for (let i = 0; i < usersTagged.membersTagged.length; i++) {
      const userIndex = data.users.findIndex(user => user.uId === usersTagged.membersTagged[i]);
      const notification = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: data.users[ownerIndex].handleStr + ' tagged you in ' + data.dms[dmIndex].name + ': ' + message.substring(0, 20),
      };
      data.users[userIndex].notifications.push(notification);
    }
  }

  setData(data);
  return {
    messageId: messageId,
  };
}

/**
 * Send and store a message within a channel sent by a given user
 *
 * @param {Token} token - the session id of the sender
 * @param {ChannelId} channelId - the channel the message was sent in
 * @param {Message} message - the message to be sent
 *
 * @returns {Error} {error: 'Invalid Channel Id.'} - channel does not exist.
 * @returns {Error} {error: 'Message contains too little characters.'} - Message has less than 1 character.
 * @returns {Error} {error: 'Message contains too many characters.'} - Message has more than 1000 characters.
 * @returns {Error} {error: 'Invalid Session.'} - Token does not correspond to an existing user.
 * @returns {Error} {error: 'Authorised user is not a channel member.'} - The authUserId corresponds to user that is not a member of the channel.
 * @returns {messageId} messageId - the Id of the stored message
 */
export function messageSendV2(token: Token, channelId: ChannelId, message: Message): MessageIdObj {
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel Id');
  if (message.length < 1) throw HTTPError(400, 'Message contains too little characters.');
  if (message.length > 1000) throw HTTPError(400, 'Message contains too many characters.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  const authUserId = getUserIdFromToken(token);
  if (!userIsChannelMember(authUserId, channelId)) throw HTTPError(400, 'Authorised user is not a channel member');

  const messageId = generateMessageId().messageId;
  const data = getData();

  data.channels.find(channel => channel.channelId === channelId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
  });

  const usersTagged = checkTag(message);
  const ownerIndex = data.users.findIndex(user => user.uId === authUserId);
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  if (usersTagged.amountTagged !== 0) {
    for (let i = 0; i < usersTagged.membersTagged.length; i++) {
      const userIndex = data.users.findIndex(user => user.uId === usersTagged.membersTagged[i]);
      const notification = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: data.users[ownerIndex].handleStr + ' tagged you in ' + data.channels[channelIndex].name + ': ' + message.substring(0, 20),
      };
      data.users[userIndex].notifications.push(notification);
    }
  }

  setData(data);
  return {
    messageId: messageId,
  };
}

/**
  * Edits the contents of an existing message.
  *
  * @param {string} token - Token of user editing the message.
  * @param {number} messageId - Id of message to be edited.
  * @param {string} message - New message to be stored.
  *
  * @returns {error: 'Invalid Message Id.'}  - Message Id does not correspond to an existing message.
  * @returns {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {error: 'Message  not sent by authorised user.'} - the message was not sent by the authorised user making this request.
  * @returns {error: 'Message size exceeds limit.'} - message is over 1000 characters long.
  * @returns {} - Message edited successfully.
*/
export function messageEditV2(token: string, messageId: number, message: string): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const authUserId = getUserIdFromToken(token);
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid Message Id.');
  if (message.length > 1000) throw HTTPError(400, 'Message size exceeds limit.');
  if (!checkUserToMessage(authUserId, messageId)) throw HTTPError(400, 'Message  not sent by authorised user.');

  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  const isDm = checkMessageToDm(messageId);
  if (isChannel === -1) {
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    if (message === '') {
      data.dms[isDm].messages.splice(dmPosition, 1);
    } else {
      data.dms[isDm].messages[dmPosition].message = message;
    }
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    if (message === '') {
      data.channels[isChannel].messages.splice(position, 1);
    } else {
      data.channels[isChannel].messages[position].message = message;
    }
  }

  if (message !== '') {
    const usersTagged = checkTag(message);
    let notification = { channelId: 0, dmId: 0, notificationMessage: '' };
    const ownerIndex = data.users.findIndex(user => user.uId === authUserId);
    if (usersTagged.amountTagged !== 0) {
      for (let i = 0; i < usersTagged.membersTagged.length; i++) {
        const userIndex = data.users.findIndex(user => user.uId === usersTagged.membersTagged[i]);
        if (isChannel === -1) {
          notification = {
            channelId: -1,
            dmId: data.dms[isDm].dmId,
            notificationMessage: data.users[ownerIndex].handleStr + ' tagged you in ' + data.dms[isDm].name + ': ' + message.substring(0, 20),
          };
        } else {
          notification = {
            channelId: data.channels[isChannel].channelId,
            dmId: -1,
            notificationMessage: data.users[ownerIndex].handleStr + ' tagged you in ' + data.channels[isChannel].name + ': ' + message.substring(0, 20),
          };
        }
        data.users[userIndex].notifications.push(notification);
      }
    }
  }

  setData(data);
  return {};
}

/**
  * Removes the contents of an existing message.
  *
  * @param {string} token - Token of user removing the message.
  * @param {number} messageId - Id of message to be removed.
  *
  * @returns {error: 'Invalid Message Id.'}  - Message Id does not correspond to an existing message.
  * @returns {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {error: 'Message  not sent by authorised user.'} - the message was not sent by the authorised user making this request.
  * @returns {} - Message removed successfully.
*/
export function messageRemoveV2(token: string, messageId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const authUserId = getUserIdFromToken(token);
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid Message Id.');
  if (!checkUserToMessage(authUserId, messageId)) throw HTTPError(400, 'Message  not sent by authorised user.');

  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    data.dms[isDm].messages.splice(dmPosition, 1);
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    data.channels[isChannel].messages.splice(position, 1);
  }

  setData(data);
  return {};
}

/**
  * Sends a message to a channel after a specified amount of time.
  *
  * @param {string} token - Token of user sending the message.
  * @param {ChannelId} channelId - the channel the message was sent in
  * @param {Message} message - the message to be sent
  * @param {number} timeSent - Id of message to be removed.
  *
  * @returns {Error} {error: 'Invalid Channel Id.'} - channel does not exist.
  * @returns {Error} {error: 'Message contains too little characters.'} - Message has less than 1 character.
  * @returns {Error} {error: 'Message contains too many characters.'} - Message has more than 1000 characters.
  * @returns {Error} {error: 'Invalid Session.'} - Token does not correspond to an existing user.
  * @returns {Error} {error: 'Authorised user is not a channel member.'} - The authUserId corresponds to user that is not a member of the channel.
  * @returns {Error} {error: 'Invalid time given!'} - timestamp given is in the past.
  * @returns {messageId} messageId - the Id of the stored message
*/
export function messageSendlaterV1(token: Token, channelId: ChannelId, message: Message, timeSent: number): MessageIdObj {
  return { messageId: 0 };
}