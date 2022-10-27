import { getData, setData } from './dataStore';
import { Error, Token, DmId, ChannelId, Message } from './interfaceTypes';
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
} from './helper';

/**
 * Send and store a DM sent by a given user
 *
 * @param {Token} token - the session id of the sender
 * @param {DmId} dmId - the dm the message was sent in
 * @param {Message} message - the message to be sent
 * @returns {messageId} messageId - the Id of the stored message
 */
export function messageSendDmV1(token: Token, dmId: DmId, message: Message): MessageIdObj | Error {
  if (!validDmId(dmId)) return { error: 'Not valid Dm Id' };
  if (message.length < 1) return { error: 'Message contains too little characters.' };
  if (message.length > 1000) return { error: 'Message contains too many characters.' };
  if (!validToken(token)) return { error: 'Invalid Token' };
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the Dm' };

  const messageId = generateMessageId().messageId;
  const data = getData();
  // Add message to DM list
  data.dms.find(dm => dm.dmId === dmId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
  });

  setData(data);
  return {
    messageId: messageId,
  };
}

/**
 * Send and store a message within a channel sent by a given user
 *
 * @param {Token} token - the session id of the sender
 * @param {ChannelId} channelId - the dm the message was sent in
 * @param {Message} message - the message to be sent
 * @returns {messageId} messageId - the Id of the stored message
 */
export function messageSendV1(token: Token, channelId: ChannelId, message: Message): MessageIdObj | Error {
  if (!validChannelId(channelId)) return { error: 'Not valid channelId' };
  if (message.length < 1) return { error: 'Message contains too little characters.' };
  if (message.length > 1000) return { error: 'Message contains too many characters.' };
  if (!validToken(token)) return { error: 'Invalid Session.' };
  const authUserId = getUserIdFromToken(token);
  if (!userIsChannelMember(authUserId, channelId)) return { error: 'Authorised user is not a channel member' };

  const messageId = generateMessageId().messageId;
  const data = getData();

  data.channels.find(channel => channel.channelId === channelId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
  });

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
export function messageEditV1(token: string, messageId: number, message: string): Record<string, never> | Error {
  if (!validToken(token)) return { error: 'Invalid Token.' };
  const authUserId = getUserIdFromToken(token);
  if (!validMessageId(messageId)) return { error: 'Invalid Message Id.' };
  if (message.length > 1000) return { error: 'Message size exceeds limit.' };
  if (!checkUserToMessage(authUserId, messageId)) return { error: 'Message  not sent by authorised user.' };

  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
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
export function messageRemoveV1(token: string, messageId: number): Record<string, never> | Error {
  if (!validToken(token)) return { error: 'Invalid Token.' };
  const authUserId = getUserIdFromToken(token);
  if (!validMessageId(messageId)) return { error: 'Invalid Message Id.' };
  if (!checkUserToMessage(authUserId, messageId)) return { error: 'Message  not sent by authorised user.' };

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
