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

function requestMessageSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v1', { token, dmId, message });
}

function requestMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v1', { token, channelId, message });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

function requestDmCreate(token: string, uIds: Array<number>) {
  return requestHelper('POST', '/dm/create/v1', { token, uIds });
}

function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v2', { token, name, isPublic });
}

function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v2', { token, channelId, start });
}

function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v1', { token, dmId, start });
}

function requestMessageEdit(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v1', { token, messageId, message });
}

describe('messageSendDm Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Not valid Dm Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    expect(requestMessageSendDm(user1.token, -10, 'hello there')).toStrictEqual({ error: expect.any(String) });
  });

  test('Message length is less than 1', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dmId = requestDmCreate(user1.token, uIds);

    expect(requestMessageSendDm(user1.token, dmId, '')).toStrictEqual({ error: expect.any(String) });
  });

  test('Message length is more than 1000', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dmId = requestDmCreate(user1.token, uIds);
    const message = 'hihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihih';

    expect(requestMessageSendDm(user1.token, dmId, message)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dmId = requestDmCreate(user1.token, uIds);

    expect(requestMessageSendDm('Test', dmId, 'Hello there')).toStrictEqual({ error: expect.any(String) });
  });
});

describe('messageSend Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid Channel Id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestMessageSend(user1.token, -10, 'Hello there')).toStrictEqual({ error: expect.any(String) });
  });

  test('Message length is less than 1', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestMessageSend(user1.token, channel1.channelId, '')).toStrictEqual({ error: expect.any(String) });
  });

  test('Message length is more than 1000', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const message = 'hihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihihih';

    expect(requestMessageSend(user1.token, channel1.channelId, message)).toStrictEqual({ error: expect.any(String) });
  });

  test('User is not a member of the channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestMessageSend(user2.token, channel1.channelId, 'Hello there')).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestMessageSend('Test', channel1.channelId, 'Hello there')).toStrictEqual({ error: expect.any(String) });
  });
});

// messageEdit V1 Testing

describe('requestMessageEdit', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Message too Long', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageEdit(user1.token, message1.messageId, `test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test`)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Message Id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageEdit(user1.token, message1.messageId + 1, 'test')).toStrictEqual({ error: expect.any(String) });
  });

  test('Message was not sent by the authorised user making this request', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageEdit(user2.token, message1.messageId, 'edited message')).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageEdit('test', message1.messageId, 'edited message')).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful Message Edit to channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
      messages: [
        {
          messageId: channel1.channelId,
          uId: user1.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: 0,
    });
  });

  // test('Successful Message Edit to DM', () => {
  //   const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
  //   const dm1 = requestDmCreate(user1.token, []);
  //   const message1 = requestMessageSendDm(user1.token, dm1.dmId, 'test');
  //   requestMessageEdit(user1.token, message1.messageId, 'edited message');
  //   expect(requestDmMessages(user1.token, dm1.dmId, 0)).toEqual({
  //     messages: [
  //       {
  //         messageId: message1.messageId,
  //         uId: user1.authUserId,
  //         message: 'edited message',
  //         timeSent: expect.any(Number),
  //       },
  //     ],
  //     start: 0,
  //     end: 0,
  //   });
  // });

  // test('Empty String Inputted', () => {
  //   const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
  //   const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
  //   const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
  //   const message2 = requestMessageSend(user1.token, channel1.channelId, 'testing');
  //   const message3 = requestMessageSend(user1.token, channel1.channelId, 'hello');
  //   requestMessageEdit(user1.token, message2.messageId, '');
  //   expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
  //     messages: [
  //       {
  //         messageId: message3.messageId,
  //         uId: user1.authUserId,
  //         message: 'hello',
  //         timeSent: expect.any(Number),
  //       },
  //       {
  //         messageId: message1.messageId,
  //         uId: user1.authUserId,
  //         message: 'test',
  //         timeSent: expect.any(Number),
  //       },
  //     ],
  //     start: 0,
  //     end: 1,
  //   });
  // });
});

// messageRemove V1 Testing

// describe('requestMessageRemove', () => {
//   beforeEach(() => {
//     requestClear();
//   });

//   test('Invalid Message Id', () => {
//     const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
//     const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
//     const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

//     expect(requestMessageRemove(user1.token, message1.messageId + 1)).toStrictEqual({ error: expect.any(String) });
//   });

//   test('Message was not sent by the authorised user making this request', () => {
//     const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
//     const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
//     const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
//     const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

//     expect(requestMessageRemove(user2.token, message1.messageId)).toStrictEqual({ error: expect.any(String) });
//   });

//   test('Invalid Token', () => {
//     const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
//     const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
//     const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

//     expect(requestMessageRemove('test', message1.messageId)).toStrictEqual({ error: expect.any(String) });
//   });

//   test('Successful Message Remove to channel', () => {
//     const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
//     const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
//     const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
//     const message2 = requestMessageSend(user1.token, channel1.channelId, 'to be removed');
//     requestMessageRemove(user1.token, message2.messageId);
//     expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
//       messages: [
//         {
//           messageId: message1.messageId,
//           uId: user1.authUserId,
//           message: 'test',
//           timeSent: expect.any(Number),
//         },
//       ],
//       start: 0,
//       end: 0,
//     });
//   });

//   test('Successful Message Remove to DM', () => {
//     const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
//     const dm1 = requestDmCreate(user1.token, []);
//     const message1 = requestMessageSendDm(user1.token, dm1.dmId, 'test');
//     const message2 = requestMessageSendDm(user1.token, dm1.dmId, 'to be removed');
//     requestMessageRemove(user1.token, message2.messageId);
//     expect(requestDmMessages(user1.token, dm1.dmId, 0)).toEqual({
//       messages: [
//         {
//           messageId: message1.messageId,
//           uId: user1.authUserId,
//           message: 'test',
//           timeSent: expect.any(Number),
//         },
//       ],
//       start: 0,
//       end: 0,
//     });
//   });
// });