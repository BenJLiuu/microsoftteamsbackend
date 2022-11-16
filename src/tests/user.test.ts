import {
  requestAuthRegister, requestUserProfile, requestUsersAll, requestUserProfileSetName,
  requestUserProfileSetEmail, requestUserProfileSetHandle, requestClear,
  requestChannelsCreate, requestChannelJoin, requestChannelDetails,
  requestUserStats, requestChannelLeave, requestDmCreate, requestDmLeave,
  requestMessageSend, requestMessageRemove, requestMessageSendDm, requestUserProfileUploadPhoto
} from './httpHelper';

describe('Test userProfile', () => {
  beforeEach(() => {
    requestClear();
  });

  test('token is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfile(user1.token + '1', user1.authUserId)).toEqual(403);
  });

  test('uId does not refer to a valid user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfile(user1.token, user1.authUserId + 1)).toEqual(400);
  });

  test('Returns user object for a valid user', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
        profileImgUrl: expect.any(String),
      },
    });
  });

  test('Returns user object for multiple valid users', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUserProfile(user1.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'John',
        nameLast: 'Mate',
        email: 'johnmate@gmail.com',
        handleStr: 'johnmate',
        profileImgUrl: expect.any(String),
      },
    });
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
        profileImgUrl: expect.any(String),
      },
    });
  });
});

// UserProfileSetName tests
describe('Test UserProfileSetName', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid first name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, '', 'Last')).toEqual(400);
    expect(requestUserProfileSetName(user1.token, 'nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'Last')).toEqual(400);
  });

  test('invalid last name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, 'First', '')).toEqual(400);
    expect(requestUserProfileSetName(user1.token, 'First', 'nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')).toEqual(400);
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token + 'z', 'Jesse', 'Pinkman')).toEqual(403);
  });

  test('successful name change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, 'Jesse', 'Pinkman')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Jesse',
          nameLast: 'Pinkman',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});

// UserProfileSetEmail tests
describe('Test userProfileSetEmail', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid email', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token, '.invalid@@..gmail.au.')).toEqual(400);
  });

  test('email in use by another user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('bcs@gmail.com', 'bcs123', 'Saul', 'Goodman');
    expect(requestUserProfileSetEmail(user1.token, 'bcs@gmail.com')).toEqual(400);
    expect(requestUserProfileSetEmail(user2.token, 'aliceP@fmail.au')).toEqual(400);
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token + 'w', 'validemail@gmail.com')).toEqual(403);
  });

  test('successful email change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token, 'new1@gmail.com')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'new1@gmail.com',
          handleStr: expect.any(String),
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});

// userProfileSetHandle tests
describe('Test userProfileSetHandle', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid handle (too short/long)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'hi')).toEqual(400);
    expect(requestUserProfileSetHandle(user1.token, 'aliceeeeeeeeeeeeeeeeeeeeeeeee')).toEqual(400);
  });

  test('invalid handle (contains non-alphanumeric)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'alice!@!')).toEqual(400);
  });

  test('handle in use by another user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestUserProfileSetHandle(user1.token, 'newname');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm123', 'Michael', 'Scott');
    expect(requestUserProfileSetHandle(user2.token, 'newname')).toEqual(400);
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token + 's', 'kevin')).toEqual(403);
  });

  test('successful handle change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'dwight')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'dwight',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });
});

describe('Test Updating User Info', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Updating nothing', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
  });

  test('Updating name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    requestUserProfileSetName(user1.token, 'John', 'Smith');
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'John',
            nameLast: 'Smith',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
  });

  test('Updating email', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    requestUserProfileSetEmail(user2.token, 'scottywhite@gmail.com');
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'scottywhite@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
  });

  test('Updating handle', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm12345', 'Michael', 'Scott');
    const user3 = requestAuthRegister('jimhalp@gmail.com', 'password', 'Jim', 'Halpert');
    const channel = requestChannelsCreate(user1.token, 'everyone', true);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    requestUserProfileSetHandle(user3.token, 'jimhalp');
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual(
      {
        name: 'everyone',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
          profileImgUrl: expect.any(String),
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
            profileImgUrl: expect.any(String),
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalp',
            profileImgUrl: expect.any(String),
          }
        ],
      }
    );
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
    expect(requestUserStats(user1.token + '1')).toEqual(403);
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

describe('Test userProfileUploadPhoto', () => {
  beforeEach(() => {
    requestClear();
  });

  test('token is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token + '1', URL, 0, 0, 200, 200)).toEqual(403);
  });

  test('url is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.testing.com/test.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 200, 200)).toEqual(400);
  });

  test('image is not jpg', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 200, 200)).toEqual(400);
  });

  test('invalid dimensions (not within original)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 900, 900)).toEqual(400);
  });

  test('invalid dimensions (not within original)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, -1, 0, 200, 200)).toEqual(400);
  });

  test('invalid dimensions (impossible x and y values)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 200, 0, 200, 200)).toEqual(400);
  });

  test('invalid dimensions (impossible x and y values)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    expect(requestUserProfileUploadPhoto(user1.token, URL, 0, 200, 200, 100)).toEqual(400);
  });

  test('Returns user object for multiple valid users', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const URL = 'http://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
    requestUserProfileUploadPhoto(user1.token, URL, 0, 0, 600, 340);
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
        profileImgUrl: expect.any(String),
      },
    });
  });
});
