import { getData, setData } from './dataStore.js';
import { validUserId, checkUserIdtoChannel } from './users.js';

//Lists all channels according to authUserId
function channelsListAllV1 (authUserId) {
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    }
  } 
  const data = getData();
  const channel_list = [];
  for (let i of data.channels) {
    channel_list.push({
      channelId: i.channels.channelId,
      name: i.channels.name
    });
  }

  return channel_list;
}

//Lists channels according to authUserID
function channelsListV1(authUserId) {
  if (!validUserId(authUserId)) {
    return {
      error: 'Invalid Authorised User Id.'
    }
  } 
  const data = getData();
  const channel_list = [];
  for (let i of data.channels) {
    if (checkUserIdtoChannel(i.users.uId, i.channels.channelId)) {
      channel_list.push({
        channelId: i.channels.channelId,
        name: i.channels.name
      });
    }
  }

  return channel_list;
}

// Create a channel as requested by a user, given the name of the channel
// and whether it should be public/private.
// Returns the new channel id.
function channelsCreateV1(authUserId, name, isPublic ) {
  if (!validUserId(authUserId)) return {
    error: "Invalid user permissions.",
  };
  if (name.length < 1 || name.length > 20) return {
    error: "Channel name must be between 1-20 characters.",
  };
  const data = getData();
  const newChannelId = new Date().getTime();
  let channel = {
    channelId: newChannelId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
  };
  data.channels.push(channel);
  setData(data);
}

export { channelsCreateV1, channelsListAllV1, channelsListV1 };