import { authRegisterV1 } from './auth.ts';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './channels.ts';
import { channelDetailsV1, channelJoinV1 } from './channel.ts';
import { clearV1 } from './other.ts';

// channelsCreateV1 tests

describe('Test channelsCreateV1 ', () => {
  beforeEach(() => {
    clearV1();
  });
  test('public channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'General', true);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('private channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('multiple channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false);
    const channel2 = channelsCreateV1(user1.authUserId, 'Homework', true);
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
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    clearV1();
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false);
    expect(channel1).toStrictEqual({
      error: 'Invalid user permissions.',
    });
  });

  test('channel name too short/long', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, '', true);
    const channel2 = channelsCreateV1(user1.authUserId, 'ABCDEFGHIJKLMNOPQRSTU', true);
    const channel3 = channelsCreateV1(user1.authUserId, 'ABCDEFGHIJKLMNOPQRST', true);
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
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true);
    const allDetails = channelsListAllV1(user1.authUserId);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general'
      }]
    });
  });

  test('one private channel list', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'private', false);
    const allDetails = channelsListAllV1(user1.authUserId);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'private'
      }]
    });
  });

  test('three channel list', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true);
    const channel2 = channelsCreateV1(user1.authUserId, 'private', false);
    const channel3 = channelsCreateV1(user1.authUserId, 'Lounge', true);
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
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const allDetails = channelsListAllV1(user1.authUserId);
    expect(allDetails).toStrictEqual({ channels: [] });
  });

  test('invalid authuserid', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    channelsCreateV1(user1.authUserId, 'general', true);
    expect(channelsListAllV1('test')).toStrictEqual({
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
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@email.com', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true);
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
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@email.com', 'alice123', 'Alice', 'Person');
    channelsCreateV1(user2.authUserId, 'secret', false);
    const channel2 = channelsCreateV1(user1.authUserId, 'private', false);
    const user1Channel = channelsListV1(user1.authUserId);
    expect(user1Channel).toStrictEqual({
      channels: [{
        channelId: channel2.channelId,
        name: 'private',
      }]
    });
  });

  test('listing no channels', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@email.com', 'alice123', 'Alice', 'Person');
    channelsCreateV1(user2.authUserId, 'lounge', true);
    const user1Channel = channelsListV1(user1.authUserId);
    expect(user1Channel).toStrictEqual({ channels: [] });
  });

  test('invalid authuserid', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true);
    channelJoinV1(user1.authUserId, channel1);
    expect(channelsListV1('test')).toStrictEqual({ error: 'Invalid Authorised User Id.' });
  });
});
