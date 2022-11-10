import { getData, setData } from './dataStore';
import { Token, DmId, ChannelId, Message, Empty, SharedMessageId } from './interfaceTypes';
import { MessageIdObj, SharedMessageIdObj } from './internalTypes';
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
  if (!checkUserIdtoDm(authUserId, dmId)) throw HTTPError(403, 'Authorised user is not a member of the Dm');

  const messageId = generateMessageId().messageId;
  const data = getData();
  // Add message to DM list
  data.dms.find(dm => dm.dmId === dmId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
    reacts: [],
    isPinned: false
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
  if (!userIsChannelMember(authUserId, channelId)) throw HTTPError(403, 'Authorised user is not a channel member');

  const messageId = generateMessageId().messageId;
  const data = getData();

  data.channels.find(channel => channel.channelId === channelId).messages.push({
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: Date.now(),
    reacts: [],
    isPinned: false
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
export function messageEditV2(token: string, messageId: number, message: string): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const authUserId = getUserIdFromToken(token);
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid Message Id.');
  if (message.length > 1000) throw HTTPError(400, 'Message size exceeds limit.');
  if (!checkUserToMessage(authUserId, messageId)) throw HTTPError(400, 'Message  not sent by authorised user.');

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

export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number): SharedMessageIdObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session');
  if (channelId !== -1 && dmId !== -1) throw HTTPError(400, 'Can only share to one channel/dm');
  if (!validMessageId(ogMessageId)) throw HTTPError(400, 'Invalid message');
  if (message.length > 1000) throw HTTPError(400, 'Message contains too many characters.');

  const data = getData();
  const uId = getUserIdFromToken(token);
  let sharedMessageId = {messageId: 0};

  if (channelId !== -1) {
    const isChannel = checkMessageToChannel(ogMessageId);
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === ogMessageId);
    const sharedMessage = data.channels[isChannel].messages[position].message;
    if (!userIsChannelMember(uId, channelId)) throw HTTPError(400, 'Not a member of the channel');
    sharedMessageId = messageSendV2(token, channelId, sharedMessage + message);
  } else if (dmId !== -1) {
    const isDm = checkMessageToDm(ogMessageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === ogMessageId);
    const sharedMessage = data.dms[isDm].messages[dmPosition].message;
    if (!checkUserIdtoDm(uId, dmId)) throw HTTPError(400, 'Not a member of the channel');
    sharedMessageId = messageSendDmV2(token, dmId, sharedMessage + message);
  } else {
    throw HTTPError (400, 'error');
  }
  setData(data);

  return {
    sharedMessageId: sharedMessageId.messageId,
  };
}

export function messageReactV1(token: string, messageId: number, reactId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message');
  if (reactId !== 1) throw HTTPError(400, 'Invalid reactId');

  const UserId = getUserIdFromToken(token);
  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    data.dms[isDm].messages[dmPosition].reacts.push(UserId);
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    data.channels[isChannel].messages[position].reacts.push(UserId);
  }

  return {};
}

export function messageUnreactV1(token: string, messageId: number, reactId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message');
  if (reactId !== 1) throw HTTPError(400, 'Invalid reactId');
  
  const UserId = getUserIdFromToken(token);
  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    const userIdIndex = data.dms[isDm].messages[dmPosition].reacts.findIndex(reacts => reacts === UserId);
    data.dms[isDm].messages[dmPosition].reacts.splice(userIdIndex, 1);
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    const userIdIndex = data.channels[isChannel].messages[position].reacts.findIndex(reacts => reacts === UserId);
    data.channels[isChannel].messages[position].reacts.splice(userIdIndex, 1);
  }

  return {};
}

export function messagePinV1(token: string, messageId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message');
  

  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    data.dms[isDm].messages[dmPosition].isPinned = true;
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    data.channels[isChannel].messages[position].isPinned = true;
  }
  setData(data);
  return {};
}

export function messageUnpinV1(token: string, messageId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message');
 
  const UserId = getUserIdFromToken(token);
  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    data.dms[isDm].messages[dmPosition].isPinned = false;
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    data.channels[isChannel].messages[position].isPinned = false;
  }
  setData(data);
  return {};
}