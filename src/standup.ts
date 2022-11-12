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

export function standupStartV1(token: Token, channelId: ChannelId, length: Length): TimeFinishObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel.');
  if (length < 0) throw HTTPError(400, 'Length must be greater than 0 seconds');
  if (getChannelFromChannelId(channelId).activeStandup === true) throw HTTPError(400, 'An active standup is already running.');
  if (validChannelId(channelId) && !userIsChannelMember(getUserIdFromToken(token), channelId)) throw HTTPError(403, 'User is not a member of the channel.');

  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  const newTimeFinish = (Math.floor((new Date()).getTime() / 1000)) + length;
  const lengthInMs = length * 1000;
  data.channels[channelIndex].activeStandup = true;
  data.channels[channelIndex].standupTimeFinish = newTimeFinish;
  setTimeout(function() {
    endStandup(token, channelId);
  }, lengthInMs);
  setData(data);
  return { timeFinish: newTimeFinish };
}

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
