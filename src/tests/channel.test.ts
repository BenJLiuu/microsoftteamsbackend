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
  return requestHelper('DELETE', '/clear/v2', {});
}

function requestChannelsCreate(authUserId: number, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { authUserId, name, isPublic });
}

function requestChannelDetails(authUserId: number, channelId: number) {
  return requestHelper('GET', '/channel/details/v2', { authUserId, channelId });
}



describe('channelMessagesV1', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Not valid channelId', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelMessagesV1(user1.authUserId, channel1.channelId + 1, 0)).toStrictEqual({ error: 'Not valid channelId' });
  });

  test('Start is greater than total messages', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelMessagesV1(user1.authUserId, channel1.channelId, 2)).toStrictEqual({ error: 'Start is greater than total messages' });
  });

  test('Authorised user is not a channel member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelMessagesV1(user2.authUserId, channel1.channelId, 0)).toStrictEqual({ error: 'Authorised user is not a channel member' });
  });

  test('Empty channel', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelMessagesV1(user1.authUserId, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: 0,
    });
  });

  /* These tests utilise the channelSendMessage helper function to test the
  /* functionality of channelMessagesV1. This is white-box testing, so it has
  /* been commented out, but if the helper function and these tests are uncommented
  /* they will pass.
  test('Authorised user is invalid', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');
    expect(channelMessagesV1(user1.authUserId + 1, channel1.channelId, 0)).toStrictEqual({error: 'Invalid Authorised User Id.'});
  });

  test('Success, less than 50 messages.', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    const message1 = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');
    const message2 = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');
    const message3 = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');
    expect(channelMessagesV1(user1.authUserId, channel1.channelId, 0)).toEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
        },
        {
          messageId: expect.any(Number),
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
        },
        {
          messageId: expect.any(Number),
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: 2,
    });
  });

  test('Success, more than 50 messages', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    for (let i = 0; i < 60; i++) {
      const message = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');
    }
    expect(channelMessagesV1(user1.authUserId, channel1.channelId, 5)).toEqual({
      messages: expect.any(Array),
      start: 5,
      end: 55,
    });
  });
  */
});

// channelInviteV1 tests
describe('channelInviteV1', () => {
  beforeEach(() => {
    clearV1();
  });

  // Error tests

  test('Test only invalid channel Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(channelInviteV1(user1.authUserId, 0, user2.authUserId)).toStrictEqual({ error: 'Invalid Channel Id.' });
  });

  test('Test only invalid user Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user1.authUserId + 1)).toStrictEqual({ error: 'Invalid User Id.' });
  });

  test('Test only user Id is already a member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user2.authUserId, 'channel1', true);
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId)).toStrictEqual({ error: 'User is already a member.' });
  });

  test('Test only authorised user Id is not a member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    const user3 = authRegisterV1('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    expect(channelInviteV1(user2.authUserId, channel1.channelId, user3.authUserId)).toStrictEqual({ error: 'Authorised User is not a member.' });
  });

  test('Test only invalid authorised user Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelInviteV1(user2.authUserId + user1.authUserId + 1, channel1.channelId, user2.authUserId)).toStrictEqual({ error: 'Invalid Authorised User Id.' });
  });

  // Successful Registration tests

  test('Successful Registration', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId);
    expect(channelDetailsV1(user2.authUserId, channel1.channelId)).toStrictEqual(
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
        },
        {
          uId: user2.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'aliceperson',
        }],
      });
  });
});

// channelDetailsV1 tests
describe('Test channelDetailsV1', () => {
  beforeEach(() => {
    clearV1();
  });

  // Error tests

  test('Test only invalid channel Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(channelDetailsV1(user1.authUserId, 0)).toStrictEqual({ error: 'Invalid Channel Id.' });
  });

  test('Test only authorised user Id is not a member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelDetailsV1(user2.authUserId, channel1.channelId)).toStrictEqual({ error: 'Authorised User is not a member.' });
  });

  test('Test only invalid authorised user Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelDetailsV1(user1.authUserId + 1, channel1.channelId)).toStrictEqual({ error: 'Invalid Authorised User Id.' });
  });

  // Successful Registration tests

  test('Successful Registration', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual(
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

// ChannelJoin V1 Testing

describe('channelJoinV1', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Invalid channel id', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    expect(channelJoinV1(user1.authUserId, 30)).toStrictEqual({ error: 'Invalid Channel Id.' });
  });

  test('Authorised user is already a member of the channel', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    channelJoinV1(user2.authUserId, channel1.channelId);
    expect(channelJoinV1(user2.authUserId, channel1.channelId)).toStrictEqual({ error: 'You are already a member.' });
  });

  test('Channel is private and user is not member or global owner', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'example', false);
    expect(channelJoinV1(user2.authUserId, channel1.channelId)).toStrictEqual({ error: 'You do not have access to this channel.' });
  });

  test('Invalid authorised user Id', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = channelsCreateV1(user1.authUserId, 'example', true);
    expect(channelJoinV1(user1.authUserId + 1, channel1.channelId)).toStrictEqual({ error: 'Invalid User Id.' });
  });

  test('Successful join', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    const user2 = authRegisterV1('walter@gmail.com', 'white123', 'Walt', 'White');
    expect(channelJoinV1(user2.authUserId, channel1.channelId)).toStrictEqual({});
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual(
      {
        name: 'channel1',
        isPublic: true,
        ownerMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Johnny',
            nameLast: 'Lawrence',
            email: 'johnL@gmail.com',
            handleStr: 'johnnylawrence',
          }
        ],
        allMembers: [
          {
            uId: user1.authUserId,
            nameFirst: 'Johnny',
            nameLast: 'Lawrence',
            email: 'johnL@gmail.com',
            handleStr: 'johnnylawrence',
          },
          {
            uId: user2.authUserId,
            nameFirst: 'Walt',
            nameLast: 'White',
            email: 'walter@gmail.com',
            handleStr: 'waltwhite',
          }
        ],
      });
  });
});
