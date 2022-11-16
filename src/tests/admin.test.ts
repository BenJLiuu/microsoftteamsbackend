import {
  requestAuthRegister, requestClear, requestChannelsCreate,
  requestChannelInvite,
  requestChannelRemoveOwner, requestChannelAddOwner,
  requestUserPermissionChange, adminUserRemove
} from './httpHelper';

describe('Permissions', () => {
  let globalOwner: any;
  let user1: any;
  let user2: any;
  let public12: any;
  let private12: any;
  let public20: any;
  let private10: any;
  beforeEach(() => {
    requestClear();
    globalOwner = requestAuthRegister('admin@email.com', 'password', 'Admin', 'Owner');
    user1 = requestAuthRegister('john@email.com', 'password', 'John', 'Smith');
    user2 = requestAuthRegister('alice@email.com', 'password', 'Alice', 'Person');
    public12 = requestChannelsCreate(user1.token, 'public12', true);
    private12 = requestChannelsCreate(user1.token, 'private12', false);
    public20 = requestChannelsCreate(user2.token, 'public20', true);
    private10 = requestChannelsCreate(user1.token, 'private10', false);
    requestChannelInvite(user1.token, public12.channelId, user2.authUserId);
    requestChannelInvite(user1.token, private12.channelId, user2.authUserId);
    requestChannelInvite(user2.token, public20.channelId, globalOwner.authUserId);
    requestChannelInvite(user1.token, private10.channelId, globalOwner.authUserId);
  });

  test('channelAddOwnerV1', () => {
    expect(requestChannelAddOwner(user1.token, public12.channelId, user2.authUserId)).toStrictEqual({});
    expect(requestChannelAddOwner(user2.token, private12.channelId, user1.authUserId)).toEqual(400);
    expect(requestChannelAddOwner(globalOwner.token, public20.channelId, globalOwner.authUserId)).toStrictEqual({});
    expect(requestChannelAddOwner(globalOwner.token, private10.channelId, globalOwner.authUserId)).toStrictEqual({});
  });

  test('channelRemoveOwnerV1', () => {
    expect(requestChannelAddOwner(user1.token, public12.channelId, user2.authUserId)).toStrictEqual({});
    expect(requestChannelRemoveOwner(user1.token, public12.channelId, user2.authUserId)).toStrictEqual({});
    expect(requestChannelAddOwner(user2.token, private12.channelId, user1.authUserId)).toEqual(400);
    expect(requestChannelRemoveOwner(user2.token, private12.channelId, user1.authUserId)).toEqual(400);
    expect(requestChannelAddOwner(globalOwner.token, public20.channelId, globalOwner.authUserId)).toStrictEqual({});
    expect(requestChannelAddOwner(globalOwner.token, private10.channelId, globalOwner.authUserId)).toStrictEqual({});
    expect(requestChannelRemoveOwner(user2.token, public20.channelId, globalOwner.authUserId)).toStrictEqual({});
    expect(requestChannelRemoveOwner(user1.token, private10.channelId, globalOwner.authUserId)).toStrictEqual({});
  });
});

describe('Test adminUserPermissionChange', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('global@owner.com', 'password123', 'Global', 'Owner');
    user2 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    user3 = requestAuthRegister('aliceP@email.com', 'passAlice', 'Alice', 'Person');
  });

  // Error tests

  test('Test invalid token', () => {
    expect(requestUserPermissionChange(user1.token + 1, user2.authUserId, 1)).toEqual(403);
  });

  test('Test invalid permissions to request admin perm change', () => {
    expect(requestUserPermissionChange(user3.token, user2.authUserId, 1)).toEqual(403);
  });

  test('Test uid does not refer to a valid user', () => {
    expect(requestUserPermissionChange(user1.token, 'THIS IS AN INVALID USER ID', 1)).toEqual(400);
  });

  test('Test uid is only global owner', () => {
    expect(requestUserPermissionChange(user1.token, user1.authUserId, 2)).toEqual(400);
  });

  test('Test permission is not valid', () => {
    expect(requestUserPermissionChange(user1.token, user2.authUserId, 3)).toEqual(400);
    expect(requestUserPermissionChange(user1.token, user2.authUserId, 0)).toEqual(400);
  });

  test('Test user already has permission level', () => {
    expect(requestUserPermissionChange(user1.token, user1.authUserId, 1)).toEqual(400);
  });

  test('Test user successfully updates permissions', () => {
    expect(requestUserPermissionChange(user1.token, user2.authUserId, 1)).toStrictEqual({});
    const channel1 = requestChannelsCreate(user3.token, 'PrivateChannel', false);
    requestChannelInvite(user3.token, channel1.channelId, user2.authUserId);
    expect(requestChannelAddOwner(user2.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
  });
});

describe('Test adminUserRemove', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('global@owner.com', 'password123', 'Global', 'Owner');
    user2 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    user3 = requestAuthRegister('aliceP@email.com', 'passAlice', 'Alice', 'Person');
  });

  // Error tests

  test('Test invalid token', () => {
    expect(requestadminUserRemove(user1.token + 1, user2.authUserId)).toEqual(403);
  });

  test('Test invalid permissions to request admin remove', () => {
    expect(requestadminUserRemove(user3.token, user2.authUserId)).toEqual(403);
  });

  test('Test uid does not refer to a valid user', () => {
    expect(requestadminUserRemove(user1.token, 'THIS IS AN INVALID USER ID')).toEqual(400);
  });

  test('Test uid is only global owner', () => {
    expect(requestadminUserRemove(user1.token, user1.authUserId)).toEqual(400);
  });

  // Success tests

  test('Test removed user has updated removed name', () => {
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(requestUserProfile(user1.token, user2.authUserId)).toEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'Removed',
        nameLast: 'user',
      },
    });
  });

  test('Test removed user is not inlcuded in users/all', () => {
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Global',
          nameLast: 'Owner',
          email: 'global@owner.com',
          handleStr: expect.any(String),
        },
        {
          uId: user2.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@email.com',
          handleStr: expect.any(String)
        }
      ]
    });
  });

  test('Test user is removed from channel member', () => {
    const channel1 = requestChannelsCreate(user3.token, 'Channel 1', true);
    requestChannelJoin(user2.token, channel1.channelId);
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual(
      {
        name: 'Channel 1',
        isPublic: true,
        ownerMembers:
        [
          {
            uId: user3.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@email.com',
            handleStr: 'aliceperson',
          }
        ],
        allMembers:
        [
          {
            uId: user3.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@email.com',
            handleStr: 'aliceperson',
          }
        ],
      }
    );
  });

  test('Test user is removed from channel owner', () => {
    // This is technically undefined behaviour, but I'm not technically very fussed.
    const channel1 = requestChannelsCreate(user3.token, 'Channel 1', true);
    requestChannelJoin(user2.token, channel1.channelId);
    expect(requestadminUserRemove(user1.token, user3.authUserId)).toStrictEqual({});
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual(
      {
        name: 'Channel 1',
        isPublic: true,
        ownerMembers: [],
        allMembers:
        [
          {
            uId: user2.authUserId,
            nameFirst: 'John',
            nameLast: 'Smith',
            email: 'johnS@email.com',
            handleStr: 'johnsmith',
          }
        ],
      }
    );
  });

  test('Test user is removed from dm', () => {
    // This is technically undefined behaviour, but I'm not technically very fussed.
    const dm1 = requestDmCreate(user3.token, [user2.authUserId]);
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(requestDmDetails(user1.token, dm1.dmId)).toStrictEqual(
      {
        name: expect.any(String),
        members: 
        [
          {
            uId: user3.authUserId,
            nameFirst: 'Alice',
            nameLast: 'Person',
            email: 'aliceP@email.com',
            handleStr: 'aliceperson',
          },
          {
            uId: user2.authUserId,
            nameFirst: 'John',
            nameLast: 'Smith',
            email: 'johnS@email.com',
            handleStr: 'johnsmith',
          }
        ]
      }
    );
  });

  test('Test global owner removed', () => {
    requestUserPermissionChange(user1.token, user2.authUserId, 1);
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toEqual({});
    expect(requestUserProfile(user1.token, user2.authUserId)).toEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'Removed',
        nameLast: 'user',
      },
    });
  });

  test('Test original global owner removed', () => {
    requestUserPermissionChange(user1.token, user2.authUserId, 1);
    expect(requestadminUserRemove(user2.token, user1.authUserId)).toEqual({});
    expect(requestUserProfile(user2.token, user1.authUserId)).toEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Removed',
        nameLast: 'user',
      },
    });
  });

  test('Test global owner removes themselves', () => {
    // This is technically undefined behaviour, but I'm not technically very fussed.
    requestUserPermissionChange(user1.token, user2.authUserId, 1);
    expect(requestadminUserRemove(user2.token, user2.authUserId)).toEqual({});
    expect(requestUserProfile(user1.token, user2.authUserId)).toEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'Removed',
        nameLast: 'user',
      },
    });
  });
  
  test('Test email is reusable after deletion', () => {
    requestUserPermissionChange(user1.token, user2.authUserId, 1);
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toEqual({});
    const user4 = requestAuthRegister('johnS@email.com', 'reusingAn', 'Email', 'ThatWasRemoved');
    expect(requestUserProfile(user1.token, user2.authUserId)).toEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'Removed',
        nameLast: 'user',
      },
    });
    expect(requestUserProfile(user1.token, user4.authUserId)).toStrictEqual({
      user: {
        uId: user4.authUserId,
        nameFirst: 'Email',
        nameLast: 'ThatWasRemoved',
        email: 'johnS@email.com',
        handleStr: 'emailthatwasremoved',
      },
    });
  });

  test('Test handle is reusable after deletion', () => {
    requestUserPermissionChange(user1.token, user2.authUserId, 1);
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toEqual({});
    const user4 = requestAuthRegister('differentJohn@ggmail.com', 'reusingTheName', 'John', 'Smith');
    expect(requestUserProfile(user1.token, user2.authUserId)).toEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'Removed',
        nameLast: 'user',
      },
    });
    expect(requestUserProfile(user1.token, user4.authUserId)).toStrictEqual({
      user: {
        uId: user4.authUserId,
        nameFirst: 'John',
        nameLast: 'Smith',
        email: 'differentJohn@ggmail.com',
        handleStr: 'johnsmith',
      },
    });
  });

  test('Test messages are deleted in channel', () => {
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestChannelJoin(user2.token, channel1.channelId);
    requestMessageSend(user2.token, channel1.channelId, 'test message');
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toEqual({});
    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].message).toStrictEqual('Removed user');
  });
  
  test('Test messages are deleted in dm', () => {
    const dm1 = requestDmCreate(user3.token, [user2.authUserId]);
    requestMessageSendDm(user2.token, dm1.dmId, 'test message');
    expect(requestadminUserRemove(user1.token, user2.authUserId)).toEqual({});
    const messageInfo = requestDmMessages(user1.token, dm1.dmId, 0);
    expect(messageInfo.messages[0].message).toStrictEqual('Removed user');
  });
});