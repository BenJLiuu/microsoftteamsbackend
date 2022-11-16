import {
  requestAuthRegister, requestUsersAll, requestClear,
  requestUsersStats, requestChannelsCreate, requestChannelJoin,
  requestChannelLeave, requestDmCreate, requestDmLeave,
  requestMessageSend, requestMessageRemove, requestMessageSendDm,
  requestDmRemove
} from './httpHelper';
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

describe('Test usersStats', () => {
  beforeEach(() => {
    requestClear();
  });

  test('token is invalid', () => {
    expect(requestUsersStats('1')).toEqual(403);
  });

  test('test only one user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 0
      },
    });
  });

  test('Test user creates one channel', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestChannelsCreate(user1.token, 'channel1', true);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1
      },
    });
  });

  test('Test user joins one channel', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelJoin(user2.token, channel1.channelId);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1
      },
    });
  });

  test('Test user joins, then leaves one channel', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelJoin(user2.token, channel1.channelId);
    requestChannelLeave(user2.token, channel1.channelId);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1 / 2
      },
    });
  });

  test('Test user creates one dm', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    requestDmCreate(user1.token, []);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1 / 2
      },
    });
  });

  test('Test user joins one dm', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    requestDmCreate(user1.token, [user2.authUserId]);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1
      },
    });
  });

  test('Test user joins, then removes one dm', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    const dm1 = requestDmCreate(user2.token, [user1.authUserId]);
    requestDmLeave(user1.token, dm1.dmId);
    requestDmRemove(user2.token, dm1.dmId);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 0
      },
    });
  });

  test('test user sends a channel message', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestMessageSend(user1.token, channel1.channelId, 'test message');
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1 / 2
      },
    });
  });

  test('test user sends a channel message, then deletes it', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const msg1 = requestMessageSend(user1.token, channel1.channelId, 'test message');
    requestMessageRemove(user1.token, msg1.messageId);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numChannelsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1 / 2
      },
    });
  });

  test('test user sends a dm message', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, 'test message');
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1
      },
    });
  });

  test('test user sends a dm message, then deletes it', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnS@gmail.au', 'johnpass', 'John', 'Smith');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    const msg1 = requestMessageSendDm(user1.token, dm1.dmId, 'test message');
    requestMessageRemove(user1.token, msg1.messageId);
    expect(requestUsersStats(user1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist:
        [
          {
            numChannelsExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        dmsExist:
        [
          {
            numDmsExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numDmsExist: 1,
            timeStamp: expect.any(Number)
          }
        ],
        messagesExist:
        [
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 1,
            timeStamp: expect.any(Number)
          },
          {
            numMessagesExist: 0,
            timeStamp: expect.any(Number)
          }
        ],
        utilizationRate: 1
      },
    });
  });
});
