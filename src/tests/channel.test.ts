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

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
}

function requestChannelDetails(authUserId: number, channelId: number) {
  return requestHelper('GET', '/channel/details/v2', { authUserId, channelId });
}

function requestChannelMessages(authUserId: number, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { authUserId, channelId, start });
}

function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v2', { token, channelId, uId });
}

function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v2', { token, channelId });
}

function requestChannelRemoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v1', { token, channelId, uId });
}

function requestChannelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v1', { token, channelId, uId });
}

function requestChannelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v1', { token, channelId });
}

describe('ChannelMessages', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Not valid channelId', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user1.authUserId, channel1.channelId + 1, 0)).toStrictEqual({ error: 'Not valid channelId' });
  });

  test('Start is greater than total messages', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user1.authUserId, channel1.channelId, 2)).toStrictEqual({ error: 'Start is greater than total messages' });
  });

  test('Authorised user is not a channel member', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user2.authUserId, channel1.channelId, 0)).toStrictEqual({ error: 'Authorised user is not a channel member' });
  });

  test('Empty channel', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user1.authUserId, channel1.channelId, 0)).toStrictEqual({

      messages: [],

      start: 0,

      end: 0,

    });
  });

  /* These tests utilise the channelSendMessage helper function to test the

  /* functionality of requestChannelMessages. This is white-box testing, so it has

  /* been commented out, but if the helper function and these tests are uncommented

  /* they will pass.

  test('Authorised user is invalid', () => {

    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');

    expect(requestChannelMessages(user1.authUserId + 1, channel1.channelId, 0)).toStrictEqual({error: 'Invalid Authorised User Id.'});

  });

  test('Success, less than 50 messages.', () => {

    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    const message1 = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');

    const message2 = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');

    const message3 = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');

    expect(requestChannelMessages(user1.authUserId, channel1.channelId, 0)).toEqual({

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

    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    for (let i = 0; i < 60; i++) {

      const message = channelSendMessageV1(user1.authUserId, channel1.channelId, 'hello');

    }

    expect(requestChannelMessages(user1.authUserId, channel1.channelId, 5)).toEqual({

      messages: expect.any(Array),

      start: 5,

      end: 55,

    });

  });

  */
});

// requestChannelInvite tests

describe('requestChannelInvite', () => {
  beforeEach(() => {
    requestClear();
  });

  // Error tests

  test('Test only invalid channel Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    expect(requestChannelInvite(user1.token, 0, user2.authUserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Test only invalid user Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelInvite(user1.token, channel1.channelId, user1.authUserId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Test only user Id is already a member', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user2.token, 'channel1', true);

    expect(requestChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Test only authorised user is not a member', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    expect(requestChannelInvite(user2.token, channel1.channelId, user3.authUserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Test only invalid token', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelInvite('test', channel1.channelId, user2.authUserId)).toStrictEqual({ error: expect.any(String) });
  });

  // Successful Registration tests

  // test('Successful Registration', () => {
  //   const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

  //   const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

  //   const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

  //   requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);

  //   expect(requestChannelDetails(user2.token, channel1.channelId)).toStrictEqual(

  //     {

  //       name: 'channel1',

  //       isPublic: true,

  //       ownerMembers: [{

  //         uId: user1.authUserId,

  //         nameFirst: 'John',

  //         nameLast: 'Smith',

  //         email: 'johnS@email.com',

  //         handleStr: 'johnsmith',

  //       }],

  //       allMembers: [{

  //         uId: user1.authUserId,

  //         nameFirst: 'John',

  //         nameLast: 'Smith',

  //         email: 'johnS@email.com',

  //         handleStr: 'johnsmith',

  //       },

  //       {

  //         uId: user2.authUserId,

  //         nameFirst: 'Alice',

  //         nameLast: 'Person',

  //         email: 'aliceP@fmail.au',

  //         handleStr: 'aliceperson',

  //       }],
  //     });
  // });
});

// requestChannelDetails tests

describe('Test requestChannelDetails', () => {
  beforeEach(() => {
    requestClear();
  });

  // Error tests

  test('Test only invalid channel Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    expect(requestChannelDetails(user1.authUserId, 0)).toStrictEqual({ error: 'Invalid Channel Id.' });
  });

  test('Test only authorised user Id is not a member', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelDetails(user2.authUserId, channel1.channelId)).toStrictEqual({ error: 'Authorised User is not a member.' });
  });

  test('Test only invalid authorised user Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelDetails(user1.authUserId + 1, channel1.channelId)).toStrictEqual({ error: 'Invalid Authorised User Id.' });
  });

  // Successful Registration tests

  test('Successful Registration', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelDetails(user1.authUserId, channel1.channelId)).toStrictEqual(

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

describe('requestChannelJoin', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid channel id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestChannelJoin(user1.token, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Authorised user is already a member of the channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    requestChannelJoin(user2.token, channel1.channelId);

    expect(requestChannelJoin(user2.token, channel1.channelId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Channel is private and user is not member or global owner', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'example', false);

    expect(requestChannelJoin(user2.token, channel1.channelId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const channel1 = requestChannelsCreate(user1.token, 'example', true);

    expect(requestChannelJoin('test', channel1.channelId)).toStrictEqual({ error: expect.any(String) });
  });

  // test('Successful join', () => {
  //   const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

  //   const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

  //   const user2 = requestAuthRegister('walter@gmail.com', 'white123', 'Walt', 'White');

  //   expect(requestChannelJoin(user2.token, channel1.channelId)).toStrictEqual({});

  //   expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual(

  //     {

  //       name: 'channel1',

  //       isPublic: true,

  //       ownerMembers: [

  //         {

  //           uId: user1.authUserId,

  //           nameFirst: 'Johnny',

  //           nameLast: 'Lawrence',

  //           email: 'johnL@gmail.com',

  //           handleStr: 'johnnylawrence',

  //         }

  //       ],

  //       allMembers: [

  //         {

  //           uId: user1.authUserId,

  //           nameFirst: 'Johnny',

  //           nameLast: 'Lawrence',

  //           email: 'johnL@gmail.com',

  //           handleStr: 'johnnylawrence',

  //         },

  //         {

  //           uId: user2.authUserId,

  //           nameFirst: 'Walt',

  //           nameLast: 'White',

  //           email: 'walter@gmail.com',

  //           handleStr: 'waltwhite',

  //         }

  //       ],

  //     });
  // });

  // channelRemoveOwner tests
  describe('requestChannelRemoveOwner Tests', () => {
    beforeEach(() => {
      requestClear();
    });

    test('Invalid channelId', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);
      requestChannelAddOwner(user1.token, channel1.channelId, user2.uId);

      expect(requestChannelRemoveOwner(user1.token, -10, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid uId', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);
      requestChannelAddOwner(user1.token, channel1.channelId, user2.uId);

      expect(requestChannelRemoveOwner(user1.token, channel1.channelId, -10)).toStrictEqual({ error: expect.any(String) });
    });

    test('User being removed is not an owner', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);

      expect(requestChannelRemoveOwner(user1.token, channel1.channelId, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('User is the only owner', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);

      expect(requestChannelRemoveOwner(user1.token, channel1.channelId, user1.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('User is not a member of the channel', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);

      expect(requestChannelRemoveOwner(user1.token, channel1.channelId, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('User is not authuorised', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'passJohn', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);
      requestChannelJoin(user3.token, channel1.channelId);
      requestChannelAddOwner(user1.token, channel1.channelId, user2.uId);

      expect(requestChannelRemoveOwner(user3.token, channel1.channelId, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid token', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'passJohn', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);
      requestChannelJoin(user3.token, channel1.channelId);
      requestChannelAddOwner(user1.token, channel1.channelId, user2.uId);

      expect(requestChannelRemoveOwner('test', channel1.channelId, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });
  });

  // channelAddOwner tests
  describe('requestChannelAddOwner Tests', () => {
    beforeEach(() => {
      requestClear();
    });

    test('Invalid channelId', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);

      expect(requestChannelAddOwner(user1.token, -10, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid uId', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);

      expect(requestChannelAddOwner(user1.token, channel1.channelId, -10)).toStrictEqual({ error: expect.any(String) });
    });

    test('User is not a member of the channel', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);

      expect(requestChannelAddOwner(user1.token, channel1.channelId, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('User is already a owner', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);

      requestChannelJoin(user2.token, channel1.channelId);
      requestChannelJoin(user3.token, channel1.channelId);

      requestChannelAddOwner(user1.token, channel1.channelId, user2.uId);
      requestChannelAddOwner(user1.token, channel1.channelId, user2.uId);

      expect(requestChannelAddOwner(user1.token, channel1.channelId, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('User is not authuorised', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'passJohn', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);
      requestChannelJoin(user3.token, channel1.channelId);

      expect(requestChannelAddOwner(user2.token, channel1.channelId, user3.uId)).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid token', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);
      requestChannelJoin(user2.token, channel1.channelId);

      expect(requestChannelAddOwner('test', channel1.channelId, user2.uId)).toStrictEqual({ error: expect.any(String) });
    });
  });

  // channelLeavetests
  describe('requestChannelAddOwner Tests', () => {
    beforeEach(() => {
      requestClear();
    });

    test('Invalid channelId', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

      expect(requestChannelLeave(user1.token, -10)).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid channelId', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);

      expect(requestChannelLeave(user2.token, channel1.channelId)).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid token', () => {
      const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
      const channel1 = requestChannelsCreate(user1.token, 'general', true);

      expect(requestChannelLeave('test', channel1.channelId)).toStrictEqual({ error: expect.any(String) });
    });
  });
});
