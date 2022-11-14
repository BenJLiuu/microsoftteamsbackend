import { getData } from './dataStore';
import { UserStats } from './interfaceTypes';
import { UId } from './interfaceTypes';

/**
 * Constructs a userStats obj for a user to track join/send history.
 * @returns {UserStats} use stats, with all joins/sends set to 0.
 */
export function userStatsConstructor(): UserStats {
  const time = Date.now();
  return {
    channelsJoined:
      [
        {
          numChannelsJoined: 0,
          timeStamp: time
        }
      ],
    dmsJoined:
      [
        {
          numDmsJoined: 0,
          timeStamp: time
        }
      ],
    messagesSent:
      [
        {
          numMessagesSent: 0,
          timeStamp: time
        }
      ],
    involvementRate: 0
  };
}

/**
 * Given a UserStats object, calculates an involvement rate.
 * @param stats - the stats (that have been updated since last calculation) to use for updated calculation
 * @returns a float between 0 and 1 (inclusive) describing involvement rate.
 */
function calculateInvolvementRate(stats: UserStats): number {
  const data = getData();
  const totalItems = data.channels.length + data.dms.length + data.messages.length;

  // add up user current channels, dms, messages sent.
  const userItems = 
    stats.channelsJoined[stats.channelsJoined.length - 1].numChannelsJoined +
    stats.dmsJoined[stats.dmsJoined.length - 1].numDmsJoined +
    stats.messagesSent[stats.messagesSent.length - 1].numMessagesSent;

  if (totalChannelsDmsMessages === 0 ) return 0;
  return min( userItems / totalItems , 1);
}

/**
 * Updates userStats for user that creates or joins a channel.
 * 
 * @param {UId} uId - user who is joining channel
 * @returns {UserStats} updated userStats obj (need to update after function call)
 */
export function userStatsJoinChannel(uId: UId): UserStats {
    const data = getData();
    let userStats = data.users.find(user => user.uId === uId).userStats;
    const channelsJoined = userStats.channelsJoined[userStats.channelsJoined.length - 1];
    userStats.channelsJoined.push({
        numChannelsJoined = channelsJoined + 1,
        timeStamp = Date.now(),
    });
    userStats.involvementRate = calculateInvolvementRate(userStats);
    return userStats;
}

/**
 * Updates userStats for user that leaves a channel.
 * 
 * @param {UId} uId - user who is leaving channel
 * @returns {UserStats} updated userStats obj (need to update after function call)
 */
 export function userStatsLeaveChannel(uId: UId): UserStats {
  const data = getData();
  let userStats = data.users.find(user => user.uId === uId).userStats;
  const channelsJoined = userStats.channelsJoined[userStats.channelsJoined.length - 1];
  userStats.channelsJoined.push({
      numChannelsJoined = channelsJoined - 1,
      timeStamp = Date.now(),
  });
  userStats.involvementRate = calculateInvolvementRate(userStats);
  return userStats;
}

/**
 * Updates userStats for user that creates / joins a Dm
 * 
 * @param {UId} uId - user who is joining dm
 * @returns {UserStats} updated userStats obj (need to update after function call)
 */
 export function userStatsJoinDm(uId: UId): UserStats {
  const data = getData();
  let userStats = data.users.find(user => user.uId === uId).userStats;
  const dmsJoined = userStats.dmsJoined[userStats.dmsJoined.length - 1];
  userStats.dmsJoined.push({
    dmsJoined = dmsJoined + 1,
      timeStamp = Date.now(),
  });
  userStats.involvementRate = calculateInvolvementRate(userStats);
  return userStats;
}

/**
 * Updates userStats for user that leaves a Dm
 * 
 * @param {UId} uId - user who is leaving dm
 * @returns {UserStats} updated userStats obj (need to update after function call)
 */
 export function userStatsJoinDm(uId: UId): UserStats {
  const data = getData();
  let userStats = data.users.find(user => user.uId === uId).userStats;
  const dmsJoined = userStats.dmsJoined[userStats.dmsJoined.length - 1];
  userStats.dmsJoined.push({
    dmsJoined = dmsJoined - 1,
      timeStamp = Date.now(),
  });
  userStats.involvementRate = calculateInvolvementRate(userStats);
  return userStats;
}

/**
 * Updates userStats for user that sends a message
 * 
 * @param {UId} uId - user who is sending message
 * @returns {UserStats} updated userStats obj (need to update after function call)
 */
 export function userStatsSendMessage(uId: UId): UserStats {
  const data = getData();
  let userStats = data.users.find(user => user.uId === uId).userStats;
  const messagesSent = userStats.messagesSent[userStats.messagesSent.length - 1];
  userStats.messagesSent.push({
    messagesSent = messagesSent - 1,
      timeStamp = Date.now(),
  });
  userStats.involvementRate = calculateInvolvementRate(userStats);
  return userStats;
}