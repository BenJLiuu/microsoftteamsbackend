import { requestAuthRegister, requestUsersAll, requestClear, requestUsersStats } from './httpHelper';

describe('Test usersAlls', () => {
  beforeEach(() => {
    requestClear();
  });

  test('session is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUsersAll(user1.token + '1')).toEqual(403);
  });

  test('return one user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
        }
      ]
    });
  });

  test('return array of users', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
        },
        {
          uId: user2.authUserId,
          nameFirst: 'John',
          nameLast: 'Mate',
          email: 'johnmate@gmail.com',
          handleStr: expect.any(String)
        }
      ]
    });
  });
});

describe('Test userStats', () => {
  let user1: any;
  let user2: any;
  let channel2: any;
  let dm1: any;

  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    user2 = requestAuthRegister('albert@email.com', 'albpass', 'Al', 'Bert');
    channel2 = requestChannelsCreate(user2.token, 'channel2', true);
  });

  test('token is invalid', () => {
    expect(requestUsersStats(user1.token + '1')).toEqual(403);
  });

  test('test user has not joined anything', () => {
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 0
      },
    });
  });

  test('Test user creates one channel', () => {
    requestChannelsCreate(user1.token, 'channel1', true);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 1 / 2
      },
    });
  });

  test('Test user joins one channel', () => {
    requestChannelJoin(user1.token, channel2.channelId);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 1
      },
    });
  });

  test('Test user joins, then leaves one channel', () => {
    requestChannelJoin(user1.token, channel2.channelId);
    requestChannelLeave(user1.token, channel2.channelId);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 0
      },
    });
  });

  test('Test user creates one dm', () => {
    requestDmCreate(user1.token, []);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 1 / 2
      },
    });
  });

  test('Test user joins one dm', () => {
    requestDmCreate(user2.token, [user1.authUserId]);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 1 / 2
      },
    });
  });

  test('Test user joins, then leaves one dm', () => {
    dm1 = requestDmCreate(user2.token, [user1.authUserId]);
    requestDmLeave(user1.token, dm1.dmId);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 0
      },
    });
  });

  test('test user sends a channel message', () => {
    requestChannelJoin(user1.token, channel2.channelId);
    requestMessageSend(user1.token, channel2.channelId, 'test message');
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 1
      },
    });
  });

  test('test user sends a channel message, then deletes it', () => {
    requestChannelJoin(user1.token, channel2.channelId);
    const msg1 = requestMessageSend(user1.token, channel2.channelId, 'test message');
    requestMessageRemove(user1.token, msg1.messageId);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 1
      },
    });
  });

  test('test user sends a dm message', () => {
    dm1 = requestDmCreate(user2.token, [user1.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, 'test message');
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 2 / 3
      },
    });
  });

  test('test user sends a dm message, then deletes it', () => {
    dm1 = requestDmCreate(user2.token, [user1.authUserId]);
    const msg1 = requestMessageSendDm(user1.token, dm1.dmId, 'test message');
    requestMessageRemove(user1.token, msg1.messageId);
    expect(requestUserStats(user1.token)).toStrictEqual({
      userStats: {
        channelsJoined:
        [
          {
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsJoined:
        [
          {
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsJoined: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesSent:
        [
          {
            numMessagesSent: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesSent: 1,
            timeStamp: expect.any(Number)
          }
        ],
        involvementRate: 1
      },
    });
  });
});