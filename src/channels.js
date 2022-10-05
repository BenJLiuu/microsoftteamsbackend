import { getData, setData } from './dataStore.js';
import { validUserId } from './users.js';

//Lists all channels according to authUserId
function channelsListAllV1 (authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  }
}

//Lists channels according to authUserID
function channelsListV1(authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  }
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

  return { channelId: channel.channelId };
}

export { channelsCreateV1 };