import { getData, setData } from './dataStore';
import { Error, messageId } from './objects';
import {
  validChannelId,
  validToken, 
  getUserIdFromToken, 
  validDmId, 
  checkUserIdtoDm, 
  checkUserIdtoChannel,
  generateMessageId,
} from './helper';

/**
 * Send and store a DM sent by a given user
 * 
 * @param token - the session id of the sender
 * @param dmId - the dm the message was sent in
 * @param message - the message to be sent
 * @returns {messageId} messageId - the Id of the stored message
 */
export function messageSendDmV1(token: string, dmId: number, message: string): messageId | Error {
  if (!validDmId(dmId)) return { error: 'Not valid Dm Id' };
  if (message.length < 1) return { error: 'Message contains too little characters.' };
  if (message.length > 1000) return { error: 'Message contains too many characters.' };
  if (!validToken(token)) return { error: 'Invalid Token' };
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the Dm' };

  const data = getData();

  const messageId = generateMessageId();

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

export function messageSendV1(token: string, channelId: number, message: string): messageId | Error {
  if (!validChannelId(channelId)) return { error: 'Not valid channelId' };
  if (message.length < 1) return { error: 'Message contains too little characters.' };
  if (message.length > 1000) return { error: 'Message contains too many characters.' };
  if (!validToken(token)) return { error: 'Invalid Session.' };
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoChannel(authUserId, channelId)) return { error: 'Authorised user is not a channel member' };

  const data = getData();
  const index = data.channels.findIndex(channel => channel.channelId === channelId);

  const currentTime = new Date();
  const time = currentTime.getHours() + currentTime.getMinutes() + currentTime.getSeconds();
  const messageId = Math.floor(Math.random() * 899999 + 100000);

  const newMessage = {
    messageId: messageId,
    uId: authUserId,
    message: message,
    timeSent: time,
  };
  data.channels[index].messages.push(newMessage);

  setData(data);
  return { messageId: messageId };
}
