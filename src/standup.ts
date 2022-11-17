import { getData, setData } from './dataStore';
import { Token, ChannelId, Message, Length, Empty } from './interfaceTypes';
import { ActiveStandupObj, TimeFinishObj } from './internalTypes';
import {
  validToken,
  validChannelId,
  getChannelFromChannelId,
  getUserIdFromToken,
  userIsChannelMember,
  endStandup
} from './helper';
import HTTPError from 'http-errors';

/**
 * Starts a standup period lasting length senconds in the given channel.
 *
 * @param {Token} - token of user requesting Standup
 * @param {ChannelId} - id of channel to start standup in
 * @param {length} - how long the standup should last (in seconds)
 *
 * @return {TimeFinishObj} - contains the finish time of standup
 * @throws 403 - if token is invalid or the user is not a member of the channel
 * @throws 400 - if the channel does not exist, length is <0 seconds, or an active standup is already running
 */
export function standupStartV1(token: Token, channelId: ChannelId, length: Length): TimeFinishObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel.');
  if (length < 0) throw HTTPError(400, 'Length must be greater than 0 seconds');
  if (getChannelFromChannelId(channelId).activeStandup === true) throw HTTPError(400, 'An active standup is already running.');
  if (validChannelId(channelId) && !userIsChannelMember(getUserIdFromToken(token), channelId)) throw HTTPError(403, 'User is not a member of the channel.');

  const data = getData();
  const channel = data.channels.find(channel => channel.channelId === channelId);
  const newTimeFinish = (Math.floor((new Date()).getTime() / 1000)) + length;
  const lengthInMs = length * 1000;
  channel.activeStandup = true;
  channel.standupTimeFinish = newTimeFinish;
  setData(data);
  setTimeout(function() {
    endStandup(token, channelId);
  }, lengthInMs);

  return { timeFinish: newTimeFinish };
}
/**
 * For a given channel, returns whether a standup is active in it.
 *
 * @param {Token} - token of user requesting StandupActive
 * @param {ChannelId} - id of channel that is being checked as active/inactive
 *
 * @returns {ActiveStandupObject} - containing the finishing time of the standup, and whether it is active
 * @throws 400 - if channelId is invalid
 * @throws 403 - if session is invalid or user is not a member of the given channel
 */
export function standupActiveV1(token: Token, channelId: ChannelId): ActiveStandupObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel Id');
  if (validChannelId(channelId) && !userIsChannelMember(getUserIdFromToken(token), channelId)) throw HTTPError(403, 'User is not a member of the channel.');
  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  if (data.channels[channelIndex].activeStandup === true) {
    return { isActive: true, timeFinish: data.channels[channelIndex].standupTimeFinish };
  } else if (data.channels[channelIndex].activeStandup === false) {
    return { isActive: false, timeFinish: null };
  }
}
/**
 * For a given channel, if a standup is currently active in the channel, sends a message to get buffered in the standup queue.
 *
 * @param token - token of user sending a message
 * @param channelId - id of channel the message should be sent to
 * @param message - contents of message to be sent to standup queue
 *
 * @returns {Empty} - message is successfully sent
 * @throws 400 - if message is too long, channel is invalid, or an active standup is not running
 * @throws 403 - if token is invalid or user is not a member of the channel
 */
export function standupSendV1(token: Token, channelId: ChannelId, message: Message): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel Id');
  if (message.length > 1000) throw HTTPError(400, 'Message is too long.');
  if (getChannelFromChannelId(channelId).activeStandup === false) throw HTTPError(400, 'An active standup is not currently running in the channel.');
  if (validChannelId(channelId) && !userIsChannelMember(getUserIdFromToken(token), channelId)) throw HTTPError(403, 'User is not a member of the channel.');
  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  const userUId = getUserIdFromToken(token);
  const user = data.users.find(currentUser => currentUser.uId === userUId);
  const currStandupMessage = String(user.handleStr + ': ' + message + '\n');
  data.channels[channelIndex].standupMessage = data.channels[channelIndex].standupMessage + currStandupMessage;
  setData(data);
  return {};
}
