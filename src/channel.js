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
  return {}
}

// Allows user to join channel given a UserId
function channelJoinV1(authUserId,channelId) {
  return {}
}
