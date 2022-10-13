import { authRegisterV1 } from './../auth';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './../channels';
import { channelDetailsV1, channelJoinV1 } from './../channel';
import { clearV1 } from './../other';
// TEMPORARY WHITE BOX TESTING PRE-HTTP
import { ChannelId, Channels, AuthUserId } from './../objects';

describe('Test channelsCreateV1 ', () => {
  beforeEach(() => {
    clearV1();
  });
  test('public channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'General', true) as ChannelId;
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('private channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false) as ChannelId;
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('multiple channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false) as ChannelId;
    const channel2 = channelsCreateV1(user1.authUserId, 'Homework', true) as ChannelId;
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });

    expect(channelDetailsV1(user1.authUserId, channel2.channelId)).toStrictEqual({
      name: 'Homework',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('invalid user permissions', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    clearV1();
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false) as ChannelId;
    expect(channel1).toStrictEqual({
      error: 'Invalid user permissions.',
    });
  });

  test('channel name too short/long', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, '', true) as ChannelId;
    const channel2 = channelsCreateV1(user1.authUserId, 'ABCDEFGHIJKLMNOPQRSTU', true) as ChannelId;
    const channel3 = channelsCreateV1(user1.authUserId, 'ABCDEFGHIJKLMNOPQRST', true) as ChannelId;
    expect(channel1).toStrictEqual({
      error: 'Channel name must be between 1-20 characters.',
    });
    expect(channel2).toStrictEqual({
      error: 'Channel name must be between 1-20 characters.',
    });
    expect(channel3).toStrictEqual({
      channelId: channel3.channelId,
    });
  });
});

// channelsListAllv1 testing
describe('Test channelsListAllv1 ', () => {
  beforeEach(() => {
    clearV1();
  });

  test('one public channel list', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true) as ChannelId;
    const allDetails = channelsListAllV1(user1.authUserId) as Channels;
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general'
      }]
    });
  });

  test('one private channel list', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'private', false) as ChannelId;
    const allDetails = channelsListAllV1(user1.authUserId) as Channels;
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'private'
      }]
    });
  });

  test('three channel list', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true) as ChannelId;
    const channel2 = channelsCreateV1(user1.authUserId, 'private', false) as ChannelId;
    const channel3 = channelsCreateV1(user1.authUserId, 'Lounge', true) as ChannelId;
    const allDetails = channelsListAllV1(user1.authUserId);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general'
      }, {
        channelId: channel2.channelId,
        name: 'private'
      }, {
        channelId: channel3.channelId,
        name: 'Lounge'
      }]
    });
  });

  test('listing no channels', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const allDetails = channelsListAllV1(user1.authUserId) as Channels;
    expect(allDetails).toStrictEqual({ channels: [] });
  });

  test('invalid authuserid', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    channelsCreateV1(user1.authUserId, 'general', true) as ChannelId;
    expect(channelsListAllV1(user1.authUserId + 1)).toStrictEqual({
      error: 'Invalid Authorised User Id.'
    });
  });
});

// channelsListV1 tests
describe('Test channelsListAllv1 ', () => {
  beforeEach(() => {
    clearV1();
  });

  test('one joined public channel list', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const user2 = authRegisterV1('aliceP@email.com', 'alice123', 'Alice', 'Person') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true) as ChannelId;
    channelsCreateV1(user2.authUserId, 'private', false);
    const user1Channel = channelsListV1(user1.authUserId);
    expect(user1Channel).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general',
      }]
    });
  });

  test('one joined private channel list', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const user2 = authRegisterV1('aliceP@email.com', 'alice123', 'Alice', 'Person') as AuthUserId;
    channelsCreateV1(user2.authUserId, 'secret', false) as ChannelId;
    const channel2 = channelsCreateV1(user1.authUserId, 'private', false) as ChannelId;
    const user1Channel = channelsListV1(user1.authUserId);
    expect(user1Channel).toStrictEqual({
      channels: [{
        channelId: channel2.channelId,
        name: 'private',
      }]
    });
  });

  test('listing no channels', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const user2 = authRegisterV1('aliceP@email.com', 'alice123', 'Alice', 'Person') as AuthUserId;
    channelsCreateV1(user2.authUserId, 'lounge', true) as ChannelId;
    const user1Channel = channelsListV1(user1.authUserId);
    expect(user1Channel).toStrictEqual({ channels: [] });
  });

  test('invalid authuserid', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true) as ChannelId;
    channelJoinV1(user1.authUserId, channel1.channelId);
    expect(channelsListV1(user1.authUserId + 1)).toStrictEqual({ error: 'Invalid Authorised User Id.' });
  });
});
