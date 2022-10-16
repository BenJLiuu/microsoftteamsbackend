import request from 'sync-request';
import { port, url } from './../config.json';
const SERVER_URL = `${url}:${port}`;

import { getData } from './../dataStore'

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v2',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v2',
    {
      json: {
        email,
        password,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v2',
    {},
  );
  return;
}

function requestChannelsCreate(authUserId: number, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v2',
    {
      json: {
        authUserId,
        name,
        isPublic
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestChannelsList(authUserId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/list/v2',
    {
      json: {
        authUserId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestChannelsListAll(authUserId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/listAll/v2',
    {
      json: {
        authUserId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestChannelDetails(authUserId: number, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/details/v2',
    {
      json: {
        authUserId,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestChannelJoin(authUserId: number, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v2',
    {
      json: {
        authUserId,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('Test channelsCreatev1', () => {
  beforeEach(() => {
    requestClear();
  });
  test('public channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, 'General', true);
    expect(requestChannelDetails(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('private channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, 'General', false);
    expect(requestChannelDetails(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('multiple channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, 'General', false);
    const channel2 = requestChannelsCreate(user1.authUserId, 'Homework', true);
    expect(requestChannelDetails(user1.authUserId, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });

    expect(requestChannelDetails(user1.authUserId, channel2.channelId)).toStrictEqual({
      name: 'Homework',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('invalid user permissions', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestClear();
    const channel1 = requestChannelsCreate(user1.authUserId, 'General', false);
    expect(channel1).toStrictEqual({
      error: 'Invalid user permissions.',
    });
  });

  test('channel name too short/long', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, '', true);
    const channel2 = requestChannelsCreate(user1.authUserId, 'ABCDEFGHIJKLMNOPQRSTU', true);
    const channel3 = requestChannelsCreate(user1.authUserId, 'ABCDEFGHIJKLMNOPQRST', true);
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
    requestClear();
  });

  test('one public channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, 'general', true);
    const allDetails = requestChannelsListAll(user1.authUserId);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general'
      }]
    });
  });

  test('one private channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, 'private', false);
    const allDetails = requestChannelsListAll(user1.authUserId);
    expect(allDetails).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'private'
      }]
    });
  });

  test('three channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, 'general', true);
    const channel2 = requestChannelsCreate(user1.authUserId, 'private', false);
    const channel3 = requestChannelsCreate(user1.authUserId, 'Lounge', true);
    const allDetails = requestChannelsListAll(user1.authUserId);
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
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const allDetails = requestChannelsListAll(user1.authUserId);
    expect(allDetails).toStrictEqual({ channels: [] });
  });

  test('invalid authuserid', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestChannelsCreate(user1.authUserId, 'general', true);
    expect(requestChannelsListAll(user1.authUserId + 1)).toStrictEqual({
      error: 'Invalid Authorised User Id.'
    });
  });
});

// requestChannelsList tests
describe('Test channelsListAllv1 ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('one joined public channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.authUserId, 'general', true);
    requestChannelsCreate(user2.authUserId, 'private', false);
    const user1Channel = requestChannelsList(user1.authUserId);
    expect(user1Channel).toStrictEqual({
      channels: [{
        channelId: channel1.channelId,
        name: 'general',
      }]
    });
  });

  test('one joined private channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    requestChannelsCreate(user2.authUserId, 'secret', false);
    const channel2 = requestChannelsCreate(user1.authUserId, 'private', false);
    const user1Channel = requestChannelsList(user1.authUserId);
    expect(user1Channel).toStrictEqual({
      channels: [{
        channelId: channel2.channelId,
        name: 'private',
      }]
    });
  });

  test('listing no channels', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    requestChannelsCreate(user2.authUserId, 'lounge', true);
    const user1Channel = requestChannelsList(user1.authUserId);
    expect(user1Channel).toStrictEqual({ channels: [] });
  });

  test('invalid authuserid', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.authUserId, 'general', true);
    requestChannelJoin(user1.authUserId, channel1.channelId);
    expect(requestChannelsList(user1.authUserId + 1)).toStrictEqual({ error: 'Invalid Authorised User Id.' });
  });
});
