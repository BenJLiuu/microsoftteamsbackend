import {
  requestAuthRegister, requestUserProfile, requestUsersAll, requestUserProfileSetName,
  requestUserProfileSetEmail, requestUserProfileSetHandle, requestClear,
  requestChannelsCreate, requestChannelJoin, requestChannelDetails, requestNotificationsGet,
  requestChannelInvite, requestDmCreate, requestMessageSendDm, requestMessageSend,
  requestMessageEdit
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
      },
    });
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
      },
    });
  });
});

describe('Test userAll', () => {
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
          handleStr: expect.any(String),
        }
      ]
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
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
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
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'John',
            nameLast: 'Smith',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
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
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'scottywhite@gmail.com',
            handleStr: 'michaelscott',
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalpert',
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
        }],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@fmail.au',
            handleStr: 'aliceperson',
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Michael',
            nameLast: 'Scott',
            email: 'michael@gmail.com',
            handleStr: 'michaelscott',
          },
          {
            uId: user3.authUserId,
            nameFirst: 'Jim',
            nameLast: 'Halpert',
            email: 'jimhalp@gmail.com',
            handleStr: 'jimhalp',
          }
        ],
      }
    );
  });
});

describe('Test notificationsGet', () => {
  beforeEach(() => {
    requestClear();
  });

  test('token is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestNotificationsGet(user1.token + '1')).toEqual(403);
  });

  test('Notification for channel invite', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [{
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'aliceperson added you to channel1',
      }],
    });
  });

  test('Notification for dm create', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [{
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'aliceperson added you to aliceperson, johnmate',
      }],
    });
  });

  test('Notification for dm create with multiple users', () => {
    requestClear();
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    expect(requestNotificationsGet(user3.token)).toStrictEqual({
      notifications: [{
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'johnnylawrence added you to aliceperson, johnnylawrence, johnnymate',
      }],
    });
  });

  test('Notification for tagged in dm', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, 'hello @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson tagged you in aliceperson, johnmate, johnnymate: hello @johnmate',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson added you to aliceperson, johnmate, johnnymate',
        }
      ],
    });
  });

  test('Notification for tagged in channel', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate how is it going today?');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate how ',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  test('Notification for tagged in edited message to channel', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate');
    requestMessageEdit(user1.token, message1.messageId, 'bye @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: bye @johnmate',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  // test('Notification for message react in dm', () => {
  //   requestClear();
  //   const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
  //   const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
  //   expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
  //     user: {
  //       uId: user1.authUserId,
  //       nameFirst: 'Alice',
  //       nameLast: 'Person',
  //       email: 'aliceP@fmail.au',
  //       handleStr: 'aliceperson',
  //     },
  //   });
  // });

  // test('Notification for message react in channel', () => {
  //   requestClear();
  //   const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
  //   const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
  //   expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
  //     user: {
  //       uId: user1.authUserId,
  //       nameFirst: 'Alice',
  //       nameLast: 'Person',
  //       email: 'aliceP@fmail.au',
  //       handleStr: 'aliceperson',
  //     },
  //   });
  // });

  // test('Over 20 Notifications', () => {
  //   requestClear();
  //   const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
  //   const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
  //   expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
  //     user: {
  //       uId: user1.authUserId,
  //       nameFirst: 'Alice',
  //       nameLast: 'Person',
  //       email: 'aliceP@fmail.au',
  //       handleStr: 'aliceperson',
  //     },
  //   });
  // });
});
