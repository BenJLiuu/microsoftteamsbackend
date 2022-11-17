import {
  requestAuthRegister, requestDmMessages, requestMessageSendDm, requestMessageSend,
  requestClear, requestDmCreate, requestChannelsCreate, requestMessageEdit,
  requestNotificationsGet, requestChannelInvite,
  requestMessageRemove, requestChannelMessages, requestMessageShare, requestChannelJoin,
  requestMessageReact, requestMessageUnreact, requestMessagePin, requestMessageUnpin,
  requestMessageSendlater, requestMessageSendlaterDm, requestSearch,
} from './httpHelper';

describe('messageSendDm Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    // Test invalid dm
    expect(requestMessageSendDm(user1.token, -10, 'hello there')).toEqual(400);

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dmId = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    // Test message less than 1 charater
    expect(requestMessageSendDm(user1.token, dmId, '')).toEqual(400);
    // Test message more than 1000 characters
    expect(requestMessageSendDm(user1.token, dmId, 'a'.repeat(1001))).toEqual(400);
    // Test invalid token
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

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    // Invalid token
    expect(requestMessageSend(user1.token, -10, 'Hello there')).toEqual(400);

    // Message is less than 1
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    expect(requestMessageSend(user1.token, channel1.channelId, '')).toEqual(400);

    // Message is longer than 1000 characters
    expect(requestMessageSend(user1.token, channel1.channelId, 'a'.repeat(1001))).toEqual(400);

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    // User is not member of channel
    expect(requestMessageSend(user2.token, channel1.channelId, 'Hello there')).toEqual(403);

    // Invalid token
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

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    // Message over 1000 characters
    expect(requestMessageEdit(user1.token, message1.messageId, 'a'.repeat(1001))).toEqual(400);
    // Invalid message id
    expect(requestMessageEdit(user1.token, message1.messageId + 1, 'test')).toEqual(400);

    // User did not send message to edit
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestMessageEdit(user2.token, message1.messageId, 'edited message')).toEqual(400);

    // Invalid token
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
          reacts: [],
          isPinned: false
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'edited message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
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
          reacts: [],
          isPinned: false
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'edited message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
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
          reacts: [],
          isPinned: false
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
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

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    // Invalid message id
    expect(requestMessageRemove(user1.token, message1.messageId + 1)).toEqual(400);

    // User trying to remove message they did not create
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestMessageRemove(user2.token, message1.messageId)).toEqual(400);

    // Invalid token
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
          reacts: [],
          isPinned: false
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
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
          reacts: [],
          isPinned: false
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ],
      start: 0,
      end: -1,
    });
  });
});

// messageShare testing

// error tests
describe('requestMessageShare', () => {
  beforeEach(() => {
    requestClear();
  });

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('Basic error cases', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user1.token, 'channel2', true);

    // Invalid token
    expect(requestMessageShare('test', message1.messageId, '', channel2.channelId, -1)).toEqual(403);

    // Invalid channel and dm id
    expect(requestMessageShare(user1.token, message1.messageId, '', -100, -100)).toEqual(400);

    // Invalid message id
    expect(requestMessageShare(user1.token, message1.messageId + 1, 'test', channel1.channelId, -1)).toEqual(400);

    // Message over 1000 characters
    expect(requestMessageShare(user1.token, message1.messageId, 'a'.repeat(1001), channel1.channelId, -1)).toEqual(400);
  });

  test('Did no specify channel or dm', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const channel2 = requestChannelsCreate(user1.token, 'channel2', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageShare(user1.token, message1.messageId, '', channel2.channelId, dm1.dmId)).toEqual(400);
  });

  test('Unathorised user ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user2.token, 'channel2', true);

    expect(requestMessageShare(user2.token, message1.messageId, '', channel2.channelId, -1)).toEqual(400);
  });

  test('Unathorised user not apart of the new channel ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user2.token, 'channel2', true);

    expect(requestMessageShare(user1.token, message1.messageId, '', channel2.channelId, -1)).toEqual(403);
  });

  // Successful test
  test('shared message through channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelJoin(user2.token, channel1.channelId);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user1.token, 'channel2', true);
    requestMessageShare(user1.token, message1.messageId, 'shared', channel2.channelId, -1);

    const messageInfo = requestChannelMessages(user1.token, channel2.channelId, 0);
    expect(messageInfo.messages[0].message).toStrictEqual('test shared');
  });

  test('shared message through dm', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSendDm(user1.token, dm1.dmId, 'test');
    requestMessageShare(user1.token, message1.messageId, 'shared', channel1.channelId, -1);

    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].message).toStrictEqual('test shared');
  });
});

// messageReact tests
describe('requestMessageReact', () => {
  beforeEach(() => {
    requestClear();
  });

  // error tests
  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageReact('test', message1.messageId, 1)).toEqual(403);
  });

  test('MessageId is invalid ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageReact(user1.token, message1.messageId + 1, 1)).toEqual(400);
  });

  test('Unathorised user ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageReact(user2.token, message1.messageId, 1)).toEqual(400);
  });

  test('Invalid react ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageReact(user1.token, message1.messageId, -10)).toEqual(400);
  });

  test('Already reacted ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageReact(user1.token, message1.messageId, 1);

    expect(requestMessageReact(user1.token, message1.messageId, 1)).toEqual(400);
  });

  // successful tests
  test('Successful react ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageReact(user1.token, message1.messageId, 1);

    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].reacts[0]).toStrictEqual(user1.authUserId);
  });
});

// messageUnreact tests
describe('requestMessageUnreact', () => {
  beforeEach(() => {
    requestClear();
  });

  // error tests
  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageReact(user1.token, message1.messageId, 1);

    expect(requestMessageUnreact('test', message1.messageId, 1)).toEqual(403);
  });

  test('MessageId is invalid ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageReact(user1.token, message1.messageId, 1);

    expect(requestMessageUnreact(user1.token, message1.messageId + 1, 1)).toEqual(400);
  });

  test('Unathorised user ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageUnreact(user2.token, message1.messageId, 1)).toEqual(400);
  });

  test('Invalid react ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageReact(user1.token, message1.messageId, 1);

    expect(requestMessageUnreact(user1.token, message1.messageId, -10)).toEqual(400);
  });

  test('Never reacted ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageUnreact(user1.token, message1.messageId, 1)).toEqual(400);
  });

  // successful tests
  test('Successful unreact ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageReact(user1.token, message1.messageId, 1);
    requestMessageUnreact(user1.token, message1.messageId, 1);

    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].reacts[0]).toStrictEqual(undefined);
  });
});

// messagePin tests
describe('requestMessagePin', () => {
  beforeEach(() => {
    requestClear();
  });

  // error tests
  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessagePin('test', message1.messageId)).toEqual(403);
  });

  test('MessageId is invalid ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessagePin(user1.token, message1.messageId + 1)).toEqual(400);
  });

  test('Unathorised user ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessagePin(user2.token, message1.messageId)).toEqual(400);
  });

  test('Already pinned', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessagePin(user1.token, message1.messageId);

    expect(requestMessagePin(user1.token, message1.messageId)).toEqual(400);
  });

  test('Not owner', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestChannelJoin(user2.token, channel1.channelId);

    expect(requestMessagePin(user2.token, message1.messageId)).toEqual(403);
  });

  // Successful tests
  test('Successful pin', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessagePin(user1.token, message1.messageId);

    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].isPinned).toStrictEqual(true);
  });
});
// messageUnin tests
describe('messageUnpin', () => {
  beforeEach(() => {
    requestClear();
  });

  // error tests
  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageUnpin('test', message1.messageId)).toEqual(403);
  });

  test('MessageId is invalid ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessagePin(user1.token, message1.messageId);

    expect(requestMessageUnpin(user1.token, message1.messageId + 1)).toEqual(400);
  });

  test('Unathorised user ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageUnpin(user2.token, message1.messageId)).toEqual(400);
  });

  test('Message is not pinned', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');

    expect(requestMessageUnpin(user1.token, message1.messageId)).toEqual(400);
  });

  test('Not owner', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestChannelJoin(user2.token, channel1.channelId);
    requestMessagePin(user1.token, message1.messageId);

    expect(requestMessageUnpin(user2.token, message1.messageId)).toEqual(403);
  });

  // Successful tests
  test('Successful unpin', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessagePin(user1.token, message1.messageId);
    requestMessageUnpin(user1.token, message1.messageId);
    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].isPinned).toStrictEqual(false);
  });
});

function generateTimeStamp() {
  return Math.floor((new Date()).getTime() / 1000);
}

describe('messageSendlater Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const currentTime = generateTimeStamp();
    // Invalid channel id
    expect(requestMessageSendlater(user1.token, -10, 'Hello there', generateTimeStamp() + 5)).toEqual(400);

    // Message length is less than 1
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    expect(requestMessageSendlater(user1.token, channel1.channelId, '', generateTimeStamp() + 5)).toEqual(400);

    // Message length is more than 1000
    expect(requestMessageSendlater(user1.token, channel1.channelId, 'a'.repeat(1001), generateTimeStamp() + 5)).toEqual(400);

    // User is not a member of the channel
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestMessageSendlater(user2.token, channel1.channelId, 'Hello there', generateTimeStamp() + 5)).toEqual(403);

    // Invalid token
    expect(requestMessageSendlater('Test', channel1.channelId, 'Hello there', currentTime + 5)).toEqual(403);

    // Invalid time
    expect(requestMessageSendlater(user1.token, channel1.channelId, 'Hello there', currentTime - 5)).toEqual(400);
  });

  test('Succesfully sent message', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    const currentTime = generateTimeStamp();
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test message');
    const message2 = requestMessageSend(user1.token, channel1.channelId, 'second test message');
    const message3 = requestMessageSendlater(user1.token, channel1.channelId, 'third test message', currentTime + 1);
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user1.authUserId,
          message: 'third test message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'second test message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
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

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    // Invalid channel id
    expect(requestMessageSendlaterDm(user1.token, -10, 'Hello there', generateTimeStamp() + 5)).toEqual(400);

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    // Message is less than 1
    expect(requestMessageSendlaterDm(user1.token, dm1.dmId, '', generateTimeStamp() + 5)).toEqual(400);

    // Message is longer than 1000 characters
    expect(requestMessageSendlaterDm(user1.token, dm1.dmId, 'a'.repeat(1001), generateTimeStamp() + 5)).toEqual(400);

    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    // User is not a member of the channel
    expect(requestMessageSendlaterDm(user3.token, dm1.dmId, 'Hello there', generateTimeStamp() + 5)).toEqual(403);

    // Invalid token
    expect(requestMessageSendlaterDm('Test', dm1.dmId, 'Hello there', generateTimeStamp() + 5)).toEqual(403);

    // Invalid time
    expect(requestMessageSendlaterDm(user1.token, dm1.dmId, 'Hello there', generateTimeStamp() - 5)).toEqual(400);
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
    const message3 = requestMessageSendlaterDm(user1.token, dm1.dmId, 'third test message', currentTime + 1);
    expect(requestDmMessages(user1.token, dm1.dmId, 0)).toEqual({
      messages: [
        {
          messageId: message3.messageId,
          uId: user1.authUserId,
          message: 'third test message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: message2.messageId,
          uId: user1.authUserId,
          message: 'second test message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: message1.messageId,
          uId: user1.authUserId,
          message: 'test message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
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

  // ERROR CASES HAVE BEEN JOINED TOGETHER TO SPEED UP TESTS
  test('Message length is less than 1 and test more than 1000', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    // less than 1
    expect(requestSearch(user1.token, '')).toEqual(400);
    // More than 1000 cahracters
    expect(requestSearch(user1.token, 'a'.repeat(1001))).toEqual(400);
    // Invalid token
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
          reacts: [],
          isPinned: false
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
          reacts: [],
          isPinned: false
        },
      ]
    });
  });

  test('Succesfully search only messages in users channels', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestMessageSend(user1.token, channel1.channelId, 'test message');
    expect(requestSearch(user2.token, 'test')).toEqual({
      messages: []
    });
  });
});

describe('Test notificationsGet', () => {
  let user1: any;
  let user2: any;

  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
  });

  test('token is invalid', () => {
    expect(requestNotificationsGet('INVALID TOKEN')).toEqual(403);
  });

  test('Notification for channel invite', () => {
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [{
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: 'aliceperson added you to channel1',
      }],
    });
  });

  test('Notification for dm create', () => {
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [{
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'aliceperson added you to aliceperson, johnmate',
      }],
    });
  });

  test('Notification for dm create with multiple users', () => {
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    expect(requestNotificationsGet(user3.token)).toStrictEqual({
      notifications: [{
        channelId: -1,
        dmId: dm1.dmId,
        notificationMessage: 'aliceperson added you to aliceperson, johnmate, johnnymate',
      }],
    });
  });

  test('Notification for tagged in dm', () => {
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, 'hello @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson tagged you in aliceperson, johnmate, johnnymate: hello @johnmate',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson added you to aliceperson, johnmate, johnnymate',
        }
      ],
    });
  });

  test('Notification for tagged in channel', () => {
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate how is it going today?');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate how ',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  test('Notification for non-member tagged in dm', () => {
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user3.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, 'hello @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [],
    });
  });

  test('Notification for non-member tagged in channel', () => {
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate how is it going today?');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [],
    });
  });

  test('Notification for multiple tags to same person in channel', () => {
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate how is it @johnmate going today?');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate how ',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  test('Notification for multiple tags to same person in dm', () => {
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    requestMessageSendDm(user1.token, dm1.dmId, '@johnmate hello @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson tagged you in aliceperson, johnmate, johnnymate: @johnmate hello @joh',
        },
        {
          channelId: -1,
          dmId: dm1.dmId,
          notificationMessage: 'aliceperson added you to aliceperson, johnmate, johnnymate',
        }
      ],
    });
  });

  test('Notification for tagged in edited message to channel', () => {
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'hello @johnmate');
    requestMessageEdit(user1.token, message1.messageId, 'bye @johnmate');
    expect(requestNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: bye @johnmate',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson tagged you in channel1: hello @johnmate',
        },
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: 'aliceperson added you to channel1',
        }
      ],
    });
  });

  // test('Notification for message react in dm', () => {
  //   requestClear();
  //   const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
  //   const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
  //   expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
  //     user: {
  //       uId: user1.authUserId,
  //       nameFirst: 'Alice',
  //       nameLast: 'Person',
  //       email: 'aliceP@fmail.au',
  //       handleStr: 'aliceperson',
  //     },
  //   });
  // });

  // test('Notification for message react in channel', () => {
  //   requestClear();
  //   const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
  //   const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
  //   expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
  //     user: {
  //       uId: user1.authUserId,
  //       nameFirst: 'Alice',
  //       nameLast: 'Person',
  //       email: 'aliceP@fmail.au',
  //       handleStr: 'aliceperson',
  //     },
  //   });
  // });

  test('Over 20 Notifications', () => {
    requestClear();
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    const message1 = requestMessageSendDm(user1.token, dm1.dmId, '1 @aliceperson');
    const message2 = requestMessageSend(user1.token, channel1.channelId, '1 @aliceperson');
    const message3 = requestMessageSendDm(user1.token, dm1.dmId, '2 @aliceperson');
    const message4 = requestMessageSend(user1.token, channel1.channelId, '2 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '3 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '3 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '4 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '4 @aliceperson');
    requestMessageEdit(user1.token, message1.messageId, '5 @aliceperson');
    requestMessageEdit(user1.token, message2.messageId, '6 @aliceperson');
    requestMessageEdit(user1.token, message3.messageId, '7 @aliceperson');
    requestMessageEdit(user1.token, message4.messageId, '8 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '9 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '9 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '10 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '10 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '11 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '11 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '12 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '12 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '13 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '13 @aliceperson');
    requestMessageSendDm(user1.token, dm1.dmId, '14 @aliceperson');
    requestMessageSend(user1.token, channel1.channelId, '14 @aliceperson');
    expect(requestNotificationsGet(user2.token).notifications.length).toBe(20);
  });
});
