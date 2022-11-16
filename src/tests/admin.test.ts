import {
  requestAuthRegister, requestClear, requestChannelsCreate,
  requestChannelInvite,
  requestChannelRemoveOwner, requestChannelAddOwner,
  requestUserPermissionChange
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
  const user1: any;
  const user2: any;
  const user3: any;
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

  test('Test uid does not refer to a valid user', () => {
    expect(requestUserPermissionChange(user1.token, 'THIS IS AN INVALID USER ID', 1)).toEqual(400);
  });

  test('Test uid is only global owner', () => {
    expect(requestUserPermissionChange(user2.token, user1.authUserId, 2)).toEqual(400);
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
    expect(requestChannelAddOwner(user2.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
  });

  // Successful Registration tests

  test('Successful Registration', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual(
      {
        name: 'channel1',
        isPublic: true,
        ownerMembers: [{
          uId: user1.authUserId,
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'johnS@email.com',
          handleStr: 'johnsmith',
        }],
        allMembers: [{
          uId: user1.authUserId,
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'johnS@email.com',
          handleStr: 'johnsmith',
        }],
      });
  });
});
