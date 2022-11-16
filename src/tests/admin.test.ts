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

describe('Admin User Permission Change', () => {

});