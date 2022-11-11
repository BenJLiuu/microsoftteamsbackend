import { getData, setData } from './dataStore';
import { Token, ChannelId, Message, Length, Time } from './interfaceTypes';
import {
  validToken,
  validChannelId,
  getChannelFromChannelId,
  getUserIdFromToken,
  endStandup
} from './helper';
import HTTPError from 'http-errors';

export function standupStartV1(token: Token, channelId: ChannelId, length: Length): number {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel.');
  if (length < 0) throw HTTPError(400, 'Length must be greater than 0 seconds');
  if (getChannel(channelId).standupIsActive === true) throw HTTPError(400, 'An active standup is already running.'); // update types
  if (validChannelId(channelId) && !userIsChannelMember(getUserIdFromToken(token), channelId)) throw HTTPError(403, 'User is not a member of the channel.');

  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  const newTimeFinish = (Math.floor((new Date()).getTime() / 1000)) + length;
  const lengthInMs = length * 1000;
  data.channels[channelIndex].standup.isActive = true;
  data.channels[channelIndex].standup.timeFinish = newTimeFinish;
  setTimeout(function() {
    endStandup(token, channelId); // make this helper function as it needs to be connected to standupSend
  }, lengthInMs);
  setData(data);
  return { timeFinish: newTimeFinish }
}

export function standupActiveV1(token: Token, channelId: ChannelId): ActiveStandupObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Session.');
  if (!validChannelId(channelId)) throw HTTPError(400, 'Invalid Channel Id');
  if (validChannelId(channelId) && !userIsChannelMember(getUserIdFromToken(token), channelId)) throw HTTPError(403, 'User is not a member of the channel.');
  const data = getData();
  const channelIndex = data.channels.findIndex(channel => channel.channelId === channelId);
  if (data.channels[channelIndex].standup.isActive === true) {
    return { isActive: true, timeFinish: data.channels[channelIndex].standup.timeFinish };
  } else if (data.channels[channelIndex].standup.isActive === false) {
    return { isActive: false, timeFinish: null };
  }
}


