import request from 'sync-request';
import { HttpVerb } from 'sync-request';
import { port, url } from './../config.json';
const SERVER_URL = `${url}:${port}`;

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json });
  return JSON.parse(res.getBody('utf-8'));
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', { email, password, nameFirst, nameLast });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
}

function requestChannelsList(token: string) {
  return requestHelper('GET', '/channels/list/v2', { token });
}

/*
function requestChannelsListAll(token: string) {
  return requestHelper('GET', '/channels/listAll/v2', { token });
}
*/

function requestChannelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v2', { token, channelId });
}

function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v2', { token, channelId });
}

describe('Test channelsCreateV1', () => {
  beforeEach(() => {
    requestClear();
  });
  test('public channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'General', true);
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('private channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'General', false);
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('multiple channel creation', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'General', false);
    const channel2 = requestChannelsCreate(user1.token, 'Homework', true);
    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'General',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });

    expect(requestChannelDetails(user1.token, channel2.channelId)).toStrictEqual({
      name: 'Homework',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array),
    });
  });

  test('invalid user permissions', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestClear();
    const channel1 = requestChannelsCreate(user1.token, 'General', false);
    expect(channel1).toStrictEqual({
      error: 'Invalid Session Id.',
    });
  });

  test('channel name too short/long', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, '', true);
    const channel2 = requestChannelsCreate(user1.token, 'ABCDEFGHIJKLMNOPQRSTU', true);
    const channel3 = requestChannelsCreate(user1.token, 'ABCDEFGHIJKLMNOPQRST', true);
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

/*
// channelsListAllv1 testing
describe('Test channelsListAllv1 ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('one public channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
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
    const channel1 = requestChannelsCreate(user1.token, 'private', false);
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
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const channel2 = requestChannelsCreate(user1.token, 'private', false);
    const channel3 = requestChannelsCreate(user1.token, 'Lounge', true);
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
    requestChannelsCreate(user1.token, 'general', true);
    expect(requestChannelsListAll(user1.authUserId + 1)).toStrictEqual({
      error: 'Invalid Authorised User Id.'
    });
  });
});
*/

// requestChannelsList tests
describe('Test channelsListV2 ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('one joined public channel list', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestChannelsCreate(user2.token, 'private', false);
    const user1Channel = requestChannelsList(user1.token);
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
    requestChannelsCreate(user2.token, 'secret', false);
    const channel2 = requestChannelsCreate(user1.token, 'private', false);
    const user1Channel = requestChannelsList(user1.token);
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
    requestChannelsCreate(user2.token, 'lounge', true);
    const user1Channel = requestChannelsList(user1.token);
    expect(user1Channel).toStrictEqual({ channels: [] });
  });

  test('invalid user permissions', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@email.com', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestChannelJoin(user2.token, channel1.channelId);
    expect(requestChannelsList('example')).toStrictEqual({ error: 'Invalid Session Id.' });
  });
});
