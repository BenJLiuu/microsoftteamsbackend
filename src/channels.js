//Lists channels according to authUserID
function channelsListV1(authUserId) {
  channels: [
    {
      channelId: 1,
      name: 'My Channel',
    }
  ],

}

// Create a channel as requested by a user, given the name of the channel
// and whether it should be public/private.
// Returns the new channel id.
function channelsCreateV1(authUserId, name, isPublic ) {
    return {
        channelId: 1,
    }
}

