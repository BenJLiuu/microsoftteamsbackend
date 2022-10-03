import { authLoginV1, authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js'; 
import { channelDetailsV1 } from './channel.js'; 
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
      channelId: expect.any(Integer),
    });
  });

});

