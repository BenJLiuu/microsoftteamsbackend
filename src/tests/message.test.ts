import {
  requestAuthRegister, requestDmMessages, requestMessageSendDm, requestMessageSend,
  requestClear, requestDmCreate, requestChannelsCreate, requestMessageEdit,
  requestMessageRemove, requestChannelMessages, requestMessageSendlater,
  requestMessageSendlaterDm, requestSearch
} from './httpHelper';

describe('messageSendDm Tests', () => {
  beforeEach(() => {
    requestClear();
  });
  // messageSendDm error tests
  test('Not valid Dm Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    expect(requestMessageSendDm(user1.token, -10, 'hello there')).toEqual(400);
  });

  test('Message length is less than 1', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dmId = requestDmCreate(user1.token, uIds);

    expect(requestMessageSendDm(user1.token, dmId, '')).toEqual(400);
  });

  test('Message length is more than 1000', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dmId = requestDmCreate(user1.token, uIds);
    const testString = 'a';
    expect(requestMessageSendDm(user1.token, dmId, testString.repeat(1001))).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dmId = requestDmCreate(user1.token, uIds);

    expect(requestMessageSendDm('Test', dmId, 'Hello there')).toEqual(403);
  });

  // Sucessful messageSendDm test
  test('Succesfully sent dm', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm = requestDmCreate(user1.token, uIds);
    requestMessageSendDm(user1.token, dm.dmId, 'test message');
    const messageInfo = requestDmMessages(user1.token, dm.dmId, 0);
    expect(messageInfo.messages[0].message).toStrictEqual('test message');
  });
});

describe('messageSend Tests', () => {
  beforeEach(() => {
    requestClear();
  });
  // messageSend error tests
  test('Invalid Channel Id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestMessageSend(user1.token, -10, 'Hello there')).toEqual(400);
  });

  test('Message length is less than 1', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestMessageSend(user1.token, channel1.channelId, '')).toEqual(400);
  });

  test('Message length is more than 1000', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const testString = 'a';
    expect(requestMessageSend(user1.token, channel1.channelId, testString.repeat(1001))).toEqual(400);
  });

  test('User is not a member of the channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestMessageSend(user2.token, channel1.channelId, 'Hello there')).toEqual(400);
  });

  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestMessageSend('Test', channel1.channelId, 'Hello there')).toEqual(403);
  });

  // Sucessful messageSend test
  test('Succesfully sent message', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    requestMessageSend(user1.token, channel1.channelId, 'test message');
    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].message).toStrictEqual('test message');
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
    const testString = 'a';
    expect(requestMessageEdit(user1.token, message1.messageId, testString.repeat(1001))).toEqual(400);
  });

  test('Invalid Message Id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageEdit(user1.token, message1.messageId + 1, 'test')).toEqual(400);
  });

  test('Message was not sent by the authorised user making this request', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageEdit(user2.token, message1.messageId, 'edited message')).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageEdit('test', message1.messageId, 'edited message')).toEqual(403);
  });

  test('Successful Message Edit to channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const message2 = requestMessageSend(user1.token, channel1.channelId, 'hi');
    requestMessageEdit(user1.token, message1.messageId, 'edited message');
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'hi',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'edited message',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Successful Message Edit to DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    const message1 = requestMessageSendDm(user1.token, dm1.dmId, 'test');
    const message2 = requestMessageSendDm(user1.token, dm1.dmId, 'hi');
    requestMessageEdit(user1.token, message1.messageId, 'edited message');
    expect(requestDmMessages(user1.token, dm1.dmId, 0)).toEqual({
      messages: [
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'hi',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'edited message',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Empty String Inputted', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const message2 = requestMessageSend(user1.token, channel1.channelId, 'testing');
    const message3 = requestMessageSend(user1.token, channel1.channelId, 'hello');
    requestMessageEdit(user1.token, message2.messageId, '');
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

// messageRemove V1 Testing

describe('requestMessageRemove', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid Message Id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageRemove(user1.token, message1.messageId + 1)).toEqual(400);
  });

  test('Message was not sent by the authorised user making this request', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageRemove(user2.token, message1.messageId)).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageRemove('test', message1.messageId)).toEqual(403);
  });

  test('Successful Message Remove to channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const message2 = requestMessageSend(user1.token, channel1.channelId, 'testing');
    const message3 = requestMessageSend(user1.token, channel1.channelId, 'hello');
    requestMessageRemove(user1.token, message2.messageId);
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('Successful Message Remove to DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    const message1 = requestMessageSendDm(user1.token, dm1.dmId, 'test');
    const message2 = requestMessageSendDm(user1.token, dm1.dmId, 'testing');
    const message3 = requestMessageSendDm(user1.token, dm1.dmId, 'hello');
    requestMessageRemove(user1.token, message2.messageId);
    expect(requestDmMessages(user1.token, dm1.dmId, 0)).toEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

function generateTimeStamp() {
  return Math.floor((new Date()).getTime() / 1000);
}

describe('messageSendlater Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid Channel Id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlater(user1.token, -10, 'Hello there', currentTime + 5)).toEqual(400);
  });

  test('Message length is less than 1', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlater(user1.token, channel1.channelId, '', currentTime + 5)).toEqual(400);
  });

  test('Message length is more than 1000', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const testString = 'a';
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlater(user1.token, channel1.channelId, testString.repeat(1001), currentTime + 5)).toEqual(400);
  });

  test('User is not a member of the channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlater(user2.token, channel1.channelId, 'Hello there', currentTime + 5)).toEqual(403);
  });

  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlater('Test', channel1.channelId, 'Hello there', currentTime + 5)).toEqual(403);
  });

  test('Invalid time', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlater(user1.token, channel1.channelId, 'Hello there', currentTime - 5)).toEqual(400);
  });

  test('Succesfully sent message', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const currentTime = generateTimeStamp();
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test message');
    const message2 = requestMessageSend(user1.token, channel1.channelId, 'second test message');
    const message3 = requestMessageSendlater(user1.token, channel1.channelId, 'third test message', currentTime + 5);
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user1.authUserId,
          message: 'third test message',
          timeSent: expect.any(Number),
        },
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'second test message',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test message',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('messageSendlaterDm Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid Dm Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlaterDm(user1.token, -10, 'Hello there', currentTime + 5)).toEqual(400);
  });

  test('Message length is less than 1', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlaterDm(user1.token, dm1.dmId, '', currentTime + 5)).toEqual(400);
  });

  test('Message length is more than 1000', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const testString = 'a';
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlaterDm(user1.token, dm1.dmId, testString.repeat(1001), currentTime + 5)).toEqual(400);
  });

  test('User is not a member of the channel', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlaterDm(user3.token, dm1.dmId, 'Hello there', currentTime + 5)).toEqual(403);
  });

  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlaterDm('Test', dm1.dmId, 'Hello there', currentTime + 5)).toEqual(403);
  });

  test('Invalid time', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const currentTime = generateTimeStamp();
    expect(requestMessageSendlaterDm(user1.token, dm1.dmId, 'Hello there', currentTime - 5)).toEqual(400);
  });

  test('Succesfully sent message', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const currentTime = generateTimeStamp();
    const message1 = requestMessageSendDm(user1.token, dm1.dmId, 'test message');
    const message2 = requestMessageSendDm(user1.token, dm1.dmId, 'second test message');
    const message3 = requestMessageSendlaterDm(user1.token, dm1.dmId, 'third test message', currentTime + 5);
    expect(requestDmMessages(user1.token, dm1.dmId, 0)).toEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user1.authUserId,
          message: 'third test message',
          timeSent: expect.any(Number),
        },
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'second test message',
          timeSent: expect.any(Number),
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test message',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('Search Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Message length is less than 1', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(requestSearch(user1.token, '')).toEqual(400);
  });

  test('Message length is more than 1000', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const testString = 'a';
    expect(requestSearch(user1.token, testString.repeat(1001))).toEqual(400);
  });

  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test message');
    expect(requestSearch('Test', 'test')).toEqual(403);
  });

  test('Succesfully search message to channel', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'Test message channel');
    expect(requestSearch(user1.token, 'test')).toEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'Test message channel',
          timeSent: expect.any(Number),
        },
      ]
    });
  });

  test('Succesfully search message to dm', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    const message1 = requestMessageSendDm(user1.token, dm1.dmId, 'tEst message dm');
    expect(requestSearch(user1.token, 'teSt')).toEqual({
      messages: [
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'tEst message dm',
          timeSent: expect.any(Number),
        },
      ]
    });
  });

  test('Succesfully search only messages in users channels', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test message');
    expect(requestSearch(user2.token, 'test')).toEqual({
      messages: []
    });
  });
});