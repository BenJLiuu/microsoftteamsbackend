import { getData, setData } from './dataStore';
import { Token, DmId, ChannelId, Message, Empty } from './interfaceTypes';
import { MessageIdObj, SharedMessageIdObj, messages } from './internalTypes';
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
  userIsChannelOwner,
  checkTag,
} from './helper';
import HTTPError from 'http-errors';
import { idText } from 'typescript';

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

  const usersTagged = checkTag(message, -1, dmId);
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

  const usersTagged = checkTag(message, channelId, -1);
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

  if (message !== '') {
    const isDm = checkMessageToDm(messageId);
    let usersTagged = { amountTagged: 0, membersTagged: [0] };
    if (isChannel === -1) {
      usersTagged = checkTag(message, -1, data.dms[isDm].dmId);
    } else {
      usersTagged = checkTag(message, data.channels[isChannel].channelId, -1);
    }
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
 * Shares an existing mesesage to a new channel/dm, with an optional message
 *
 * @param {Token} token - the session id of the sender.
 * @param {OgMessageId} ogMessageId - the existing message wished to be shared.
 * @param {Message} message - the message to be sent.
 * @param {ChannelId} channelId - the channel the message was sent in.
 * @param {DmId} dmId - the dm the message was sent in.
 *
 * @returns {Error} {error: 'Invalid session.'} - Token does not correspond to an existing user.
 * @returns {Error} {error: 'Can only share to one channel/dm.'} - User tried to share to both a dm and a channel.
 * @returns {Error} {error: 'Invalid message.'} - Message does not exist.
 * @returns {Error} {error: 'Message contains too many characters.'} - Message has over 1000 characters.
 * @returns {Error} {error: 'Could not find message in channels/dms the user has joined.'} - The authUserId corresponds to user that is not a member of the dm/channel that holds the message.
 * @returns {Error} {error: 'Not a member of the channel.'} - The user is not a member of the channel they are trying to share to.
 * @returns {Error} {error: 'Not a member of the dm.'} - The user is not a member of the dm they are trying to share to.
 * @returns {SharedMessageId} sharedMessageId - the Id of the shared message.
 */
export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number): SharedMessageIdObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid session.');
  if (channelId !== -1 && dmId !== -1) throw HTTPError(400, 'Can only share to one channel/dm.');
  if (!validMessageId(ogMessageId)) throw HTTPError(400, 'Invalid message.');
  if (message.length > 1000) throw HTTPError(400, 'Message contains too many characters.');

  const data = getData();
  const uId = getUserIdFromToken(token);
  const sharedMessageId = { messageId: 0 };
  let sharedMessage = '';
  if (channelId !== -1) {
    if (checkMessageToChannel(ogMessageId) !== -1) {
      const isChannel = checkMessageToChannel(ogMessageId);
      const position = data.channels[isChannel].messages.findIndex(message => message.messageId === ogMessageId);
      const ogChannelId = data.channels[isChannel].channelId;
      if (!userIsChannelMember(uId, ogChannelId)) throw HTTPError(400, 'Could not find message in channels/dms the user has joined.');
      sharedMessage = data.channels[isChannel].messages[position].message;
    } else {
      const isDm = checkMessageToDm(ogMessageId);
      const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === ogMessageId);
      const ogDmId = data.dms[isDm].dmId;
      if (!checkUserIdtoDm(uId, ogDmId)) throw HTTPError(400, 'Could not find message in the channels/dms the user has joined.');
      sharedMessage = data.dms[isDm].messages[dmPosition].message;
    }
    if (!userIsChannelMember(uId, channelId)) throw HTTPError(403, 'Not a member of the channel.');
    const sharedMessageId = generateMessageId().messageId;
    data.channels.find(channel => channel.channelId === channelId).messages.push({
      messageId: sharedMessageId,
      uId: uId,
      message: sharedMessage + ' ' + message,
      timeSent: Date.now(),
      reacts: [],
      isPinned: false
    });
  } else if (dmId !== -1) {
    if (checkMessageToChannel(ogMessageId) !== -1) {
      const isChannel = checkMessageToChannel(ogMessageId);
      const position = data.channels[isChannel].messages.findIndex(message => message.messageId === ogMessageId);
      const ogChannelId = data.channels[isChannel].channelId;
      if (!userIsChannelMember(uId, ogChannelId)) throw HTTPError(400, 'Could not find message in channels/dms the user has joined.');
      sharedMessage = data.channels[isChannel].messages[position].message;
    } else {
      const isDm = checkMessageToDm(ogMessageId);
      const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === ogMessageId);
      const ogDmId = data.dms[isDm].dmId;
      if (!checkUserIdtoDm(uId, ogDmId)) throw HTTPError(400, 'Could not find message in the channels/dms the user has joined.');
      sharedMessage = data.dms[isDm].messages[dmPosition].message;
    }
    if (!checkUserIdtoDm(uId, dmId)) throw HTTPError(403, 'Not a member of the dm.');
    const sharedMessageId = generateMessageId().messageId;
    data.dms.find(dm => dm.dmId === dmId).messages.push({
      messageId: sharedMessageId,
      uId: uId,
      message: sharedMessage + ' ' + message,
      timeSent: Date.now(),
      reacts: [],
      isPinned: false
    });

    throw HTTPError(400, 'error');
  }

  setData(data);

  return {
    sharedMessageId: sharedMessageId.messageId,
  };
}

/**
 * Reacts to a message
 *
 * @param {Token} token - the session id of the sender.
 * @param {MessageId} ogMessageId - the existing message wished to be reacted to.
 * @param {ReactId} reactId - the id of the desired reaction.
 *
 * @returns {Error} {error: 'Invalid session.'} - Token does not correspond to an existing user.
 * @returns {Error} {error: 'Invalid message.'} - Message does not exist.
 * @returns {Error} {error: 'Invalid reactId.'} - React Id does not exist.
 * @returns {Error} {error: 'User already reacted to this message'} - The user has an existing reaction to the message.
 * @returns {Error} {error: 'Not a member of the dm.'} - The user is not a member of the dm they are trying to share to.
 * @returns {Error} {error: 'Not a member of the channel.'} - The user is not a member of the channel they are trying to share to.
 * @returns {} message reacted to succesfully.
 */
export function messageReactV1(token: string, messageId: number, reactId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message.');
  if (reactId !== 1) throw HTTPError(400, 'Invalid reactId.');

  const UserId = getUserIdFromToken(token);
  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    const dmId = data.dms[isDm].dmId;
    if (checkUserIdtoDm(UserId, dmId)) {
      if (data.dms[isDm].messages[dmPosition].reacts.includes(UserId)) throw HTTPError(400, 'User already reacted to this message.');
      data.dms[isDm].messages[dmPosition].reacts.push(UserId);
    } else throw HTTPError(400, 'User is not a member of the dm.');
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    const channelId = data.channels[isChannel].channelId;
    if (userIsChannelMember(UserId, channelId)) {
      if (data.channels[isChannel].messages[position].reacts.includes(UserId)) throw HTTPError(400, 'User already reacted to this message.');
      data.channels[isChannel].messages[position].reacts.push(UserId);
    } else throw HTTPError(400, 'User is not a member of the channel.');
  }
  setData(data);

  return {};
}

/**
 * Unreacts to a message
 *
 * @param {Token} token - the session id of the sender.
 * @param {MessageId} ogMessageId - the existing message wished to be reacted to.
 * @param {ReactId} reactId - the id of the desired reaction.
 *
 * @returns {Error} {error: 'Invalid session.'} - Token does not correspond to an existing user.
 * @returns {Error} {error: 'Invalid message.'} - Message does not exist.
 * @returns {Error} {error: 'Invalid reactId.'} - React Id does not exist.
 * @returns {Error} {error: 'User has not reacted to this message.'} - The user does not have an existing reaction to the message.
 * @returns {Error} {error: 'Not a member of the dm.'} - The user is not a member of the dm they are trying to share to.
 * @returns {Error} {error: 'Not a member of the channel.'} - The user is not a member of the channel they are trying to share to.
 * @returns {} message reacted to succesfully.
 */
export function messageUnreactV1(token: string, messageId: number, reactId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message.');
  if (reactId !== 1) throw HTTPError(400, 'Invalid reactId.');

  const UserId = getUserIdFromToken(token);
  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    const dmId = data.dms[isDm].dmId;
    if (checkUserIdtoDm(UserId, dmId)) {
      if (!data.dms[isDm].messages[dmPosition].reacts.includes(UserId)) throw HTTPError(400, 'User has not reacted to this message.');
      const userIdIndex = data.dms[isDm].messages[dmPosition].reacts.findIndex(reacts => reacts === UserId);
      data.dms[isDm].messages[dmPosition].reacts.splice(userIdIndex, 1);
    } else throw HTTPError(400, 'User is not a member of the dm.');
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    const channelId = data.channels[isChannel].channelId;
    if (userIsChannelMember(UserId, channelId)) {
      if (!data.channels[isChannel].messages[position].reacts.includes(UserId)) throw HTTPError(400, 'User has not reacted to this message.');
      const userIdIndex = data.channels[isChannel].messages[position].reacts.findIndex(reacts => reacts === UserId);
      data.channels[isChannel].messages[position].reacts.splice(userIdIndex, 1);
    } else throw HTTPError(400, 'User is not a member of the channel.');
  }
  setData(data);

  return {};
}

/**
 * Pins a message
 *
 * @param {Token} token - the session id of the sender.
 * @param {MessageId} ogMessageId - the existing message wished to be reacted to.
 *
 * @returns {Error} {error: 'Invalid session.'} - Token does not correspond to an existing user.
 * @returns {Error} {error: 'Invalid message.'} - Message does not exist.
 * @returns {Error} {error: 'User does not have permissions.'} - User does not have owner permissions
 * @returns {Error} {error: 'Message is already pinned.'} - The message is already pinned
 * @returns {Error} {error: 'User is not a member of the dm.'} - The user is not a member of the dm they are trying to share to.
 * @returns {Error} {error: 'User is not a member of the channel.'} - The user is not a member of the channel they are trying to share to.
 * @returns {} message pinned succesfully.
 */
export function messagePinV1(token: string, messageId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message.');

  const UserId = getUserIdFromToken(token);
  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    const dmId = data.dms[isDm].dmId;
    if (checkUserIdtoDm(UserId, dmId)) {
      if (data.dms[isDm].owner.uId !== UserId) throw HTTPError(403, 'User does not have permissions.');
      if (data.dms[isDm].messages[dmPosition].isPinned) throw HTTPError(400, 'Message is already pinned.');
      data.dms[isDm].messages[dmPosition].isPinned = true;
    } else throw HTTPError(400, 'User is not a member of the dm.');
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    const channelId = data.channels[isChannel].channelId;
    if (userIsChannelMember(UserId, channelId)) {
      if (!userIsChannelOwner(UserId, channelId)) throw HTTPError(403, 'User does not have permissions.');
      if (data.channels[isChannel].messages[position].isPinned) throw HTTPError(400, 'Message is already pinned.');
      data.channels[isChannel].messages[position].isPinned = true;
    } else throw HTTPError(400, 'User is not a member of the channel.');
  }
  setData(data);
  return {};
}

/**
 * Unpins a message
 *
 * @param {Token} token - the session id of the sender.
 * @param {MessageId} ogMessageId - the existing message wished to be reacted to.
 *
 * @returns {Error} {error: 'Invalid session.'} - Token does not correspond to an existing user.
 * @returns {Error} {error: 'Invalid message.'} - Message does not exist.
 * @returns {Error} {error: 'User does not have permissions.'} - User does not have owner permissions
 * @returns {Error} {error: 'Message is not currently pinned.'} - The message is not pinned
 * @returns {Error} {error: 'User is not a member of the dm.'} - The user is not a member of the dm they are trying to share to.
 * @returns {Error} {error: 'User is not a member of the channel.'} - The user is not a member of the channel they are trying to share to.
 * @returns {} message pinned succesfully.
 */
export function messageUnpinV1(token: string, messageId: number): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validMessageId(messageId)) throw HTTPError(400, 'Invalid message.');

  const UserId = getUserIdFromToken(token);
  const data = getData();

  const isChannel = checkMessageToChannel(messageId);
  if (isChannel === -1) {
    const isDm = checkMessageToDm(messageId);
    const dmPosition = data.dms[isDm].messages.findIndex(message => message.messageId === messageId);
    const dmId = data.dms[isDm].dmId;
    if (checkUserIdtoDm(UserId, dmId)) {
      if (data.dms[isDm].owner.uId !== UserId) throw HTTPError(403, 'User does not have permissions.');
      if (!data.dms[isDm].messages[dmPosition].isPinned) throw HTTPError(400, 'Message is not currently pinned.');
      data.dms[isDm].messages[dmPosition].isPinned = false;
    } else throw HTTPError(400, 'User is not a member of the dm.');
  } else {
    const position = data.channels[isChannel].messages.findIndex(message => message.messageId === messageId);
    const channelId = data.channels[isChannel].channelId;
    if (userIsChannelMember(UserId, channelId)) {
      if (!userIsChannelOwner(UserId, channelId)) throw HTTPError(403, 'User does not have permissions.');
      if (!data.channels[isChannel].messages[position].isPinned) throw HTTPError(400, 'Message is not currently pinned.');
      data.channels[isChannel].messages[position].isPinned = false;
    } else throw HTTPError(400, 'User is not a member of the channel.');
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
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel Id');
  if (message.length < 1) throw HTTPError(400, 'Message contains too little characters.');
  if (message.length > 1000) throw HTTPError(400, 'Message contains too many characters.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  const authUserId = getUserIdFromToken(token);
  if (!userIsChannelMember(authUserId, channelId)) throw HTTPError(403, 'Authorised user is not a channel member');
  let currentTime = Math.floor((new Date()).getTime() / 1000);
  if (currentTime > timeSent) throw HTTPError(400, 'Invalid time given!');
  while (Math.floor((new Date()).getTime() / 1000) !== timeSent) {
    currentTime = Math.floor((new Date()).getTime() / 1000);
  }
  const newMessage = messageSendV2(token, channelId, message);
  return { messageId: newMessage.messageId };
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
export function messageSendlaterDmV1(token: Token, dmId: DmId, message: Message, timeSent: number): MessageIdObj {
  if (!validDmId(dmId)) throw HTTPError(400, 'Invalid Dm Id');
  if (message.length < 1) throw HTTPError(400, 'Message contains too little characters.');
  if (message.length > 1000) throw HTTPError(400, 'Message contains too many characters.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) throw HTTPError(403, 'Authorised user is not a member of the Dm');
  let currentTime = Math.floor((new Date()).getTime() / 1000);
  if (currentTime > timeSent) throw HTTPError(400, 'Invalid time given!');
  while (Math.floor((new Date()).getTime() / 1000) !== timeSent) {
    currentTime = Math.floor((new Date()).getTime() / 1000);
  }
  const newMessage = messageSendDmV2(token, dmId, message);
  return { messageId: newMessage.messageId };
}

/**
  * Takes in a query string and returns all messages containing the query.
  *
  * @param {string} token - Token of user sending the message.
  * @param {string} queryStr - the query to be checked.
  *
  * @returns {Error} {error: 'Query contains too little characters.'} - Query has less than 1 character.
  * @returns {Error} {error: 'Query contains too many characters.'} - Query has more than 1000 characters.
  * @returns {Error} {error: 'Invalid Session.'} - Token does not correspond to an existing user.
  * @returns {messages} Messages - array of all messages containing the query.
*/
export function searchV1(token: Token, queryStr: string): messages {
  if (queryStr.length < 1) throw HTTPError(400, 'Query contains too little characters.');
  if (queryStr.length > 1000) throw HTTPError(400, 'Query contains too many characters.');
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  const authUserId = getUserIdFromToken(token);
  const data = getData();
  const channelsArray = [];
  for (let i = 0; i < data.channels.length; i++) {
    if (userIsChannelMember(authUserId, data.channels[i].channelId)) {
      channelsArray.push(data.channels[i]);
    }
  }
  const dmsArray = [];
  for (let i = 0; i < data.dms.length; i++) {
    if (checkUserIdtoDm(authUserId, data.dms[i].dmId)) {
      dmsArray.push(data.dms[i]);
    }
  }

  const messagesArray = [];
  const query = queryStr.toLowerCase();
  for (let i = 0; i < channelsArray.length; i++) {
    for (let j = 0; j < channelsArray[i].messages.length; j++) {
      const message = channelsArray[i].messages[j].message.toLowerCase();
      if (message.includes(query)) {
        messagesArray.push(channelsArray[i].messages[j]);
      }
    }
  }
  for (let i = 0; i < dmsArray.length; i++) {
    for (let j = 0; j < dmsArray[i].messages.length; j++) {
      const message = dmsArray[i].messages[j].message.toLowerCase();
      if (message.includes(query)) {
        messagesArray.push(dmsArray[i].messages[j]);
      }
    }
  }
  return { messages: messagesArray };
}
