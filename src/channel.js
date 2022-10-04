import { getData, setData } from './dataStore.js';
import { validUserId, validChannelId } from './users.js';

// Sends a message from a user to a given channel, recording time sent.
function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [
      {
        messageId: 1,
        uId: 1,
        message: 'Hello world',
        timeSent: 1582426789,
      }
    ],
    start: 0,
    end: 50,
  }
}

// Sends a user specific invite to a given channel 
function channelInviteV1(authUserId, channelId, uId) {

  if (!validChannelId(channelId)) {
    return {
      error: 'Invalid Channel Id.'
    }
  } 
  if (!validUserId(uId)) {
    return {
      error: 'Invalid User Id.'
    }
  } 
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    }
  } 
  if (checkUserIdtoChannel(uId, channelId)) {
    return {
      error: 'User is already a member.'
    }
  } 
  if (!checkUserIdtoChannel(authUserId, channelId)) {
    return {
      error: 'Authorised User is not a member.'
    }
  } 
    
  const data = getData();
  let position = 0;
  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) {
        position = i;
    }
  }
  data.channels[i].allMembers.push(uId);
  setData(data);
}

// Provides the details of the owner and members of a given channel
function channelDetailsV1() {
  return {
	  name: 'Hayden',
	  ownerMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
    allMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
  }
}

// Allows user to join channel given a UserId
function channelJoinV1(authUserId,channelId) {
  return {}
}
