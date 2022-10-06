import { authLoginV1, authRegisterV1 } from './auth.js';
import { channelsCreateV1, channelsListAllV1 } from './channels.js'; 
import { channelDetailsV1, channelJoinV1 } from './channel.js'; 
import { clearV1 } from './other.js';

// channelsCreateV1 tests

describe('Test channelsCreateV1 ', () => {
  beforeEach(() => {
    clearV1();
  });
  test('public channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'General', true);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: "General",
      isPublic: true,
      ownerMembers: [user1.authUserId],
      allMembers: [user1.authUserId],
    });
  });

  test('private channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: "General",
      isPublic: false,
      ownerMembers: [user1.authUserId],
      allMembers: [user1.authUserId],
    });
  });

  test('multiple channel creation', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false);
    const channel2 = channelsCreateV1(user1.authUserId, 'Homework', true);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: "General",
      isPublic: false,
      ownerMembers: [user1.authUserId],
      allMembers: [user1.authUserId],
    });

    expect(channelDetailsV1(user1.authUserId, channel2.channelId)).toStrictEqual({
      name: "Homework",
      isPublic: true,
      ownerMembers: [user1.authUserId],
      allMembers: [user1.authUserId],
    });
  });

  test('invalid user permissions', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    clearV1();
    const channel1 = channelsCreateV1(user1.authUserId, 'General', false);
    expect(channel1).toStrictEqual({
      error: "Invalid user permissions.",
    });
  });

  test('channel name too short/long', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, '', true);
    const channel2 = channelsCreateV1(user1.authUserId, 'ABCDEFGHIJKLMNOPQRSTU', true);
    const channel2 = channelsCreateV1(user1.authUserId, 'ABCDEFGHIJKLMNOPQRST', true);
    expect(channel1).toStrictEqual({
      error: "Channel name must be between 1-20 characters.",
    });
    expect(channel2).toStrictEqual({
      error: "Channel name must be between 1-20 characters.",
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
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    clearV1();
  });
  
  test('one public channel list', () => {
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true);
    const all_channels_details = channelsListAllV1(user1);
    expect(all_channels_details).toStrictEqual({
      channelId: channel1,
      name: 'general'
    });
  });

  test('one private channel list', () => {
    const channel1 = channelsCreateV1(user1.authUserId, 'private', false);
    const all_channels_details = channelsListAllV1(user1);
    expect(all_channels_details).toStrictEqual({
      channelId: channel1,
      name: 'private'
    });
  });

  test('three channel list', () => {
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true);
    const channel2 = channelsCreateV1(user1.authUserId, 'private', false);
    const channel3 = channelsCreateV1(user1.authUserId, 'Lounge', true);
    const all_channels_details = channelsListAllV1(user1);
    expect(all_channels_details).toStrictEqual({
      channelId: channel1,
      name: 'general',
      channelId: channel2,
      name: 'private',
      channelId: channel3,
      name: 'Lounge',
    });
  });

  test('listing no channels', () => {
    const all_channels_details = channelsListAllV1(user1);
    expect(all_channels_details).toStrictEqual({});
  });

  test('invalid authuserid', () => {
    const user2 = authRegisterV1('aliceP@email.com', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'general', true);
    expect(channelsListAllV1(user2)).toStrictEqual({
      error: "Invalid user permissions."
    });
  });
});
