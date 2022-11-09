import {
  requestAuthRegister, requestDmMessages, requestMessageSendDm, requestMessageSend,
  requestClear, requestDmCreate, requestChannelsCreate, requestMessageEdit,
  requestMessageRemove, requestChannelMessages, requestMessageShare, requestChannelJoin,
  requestMessageReact
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

    expect(requestMessageSendDm(user1.token, dmId, `testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest`)).toEqual(400);
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

    expect(requestMessageSend(user1.token, channel1.channelId, `testtesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest
    testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest`)).toEqual(400);
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

    expect(requestMessageEdit(user1.token, message1.messageId, `test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test test test test test test test test test test test test 
    test test test test test test test test test test test test test test test test test`)).toEqual(400);
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


// messageShare testing

// error tests
describe('requestMessageShare', () => {
  beforeEach(() => {
    requestClear();
  });
  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user1.token, 'channel2', true);

    expect(requestMessageShare(test, message1.messageId, '', channel2.channelId, -1)).toEqual(403);
  });
  
  test('Invalid Channel and Dm Id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    

    expect(requestMessageShare(user1.token, message1.messageId, '', -100, -100)).toEqual(400);
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


  test('ogMessageId is invalid ', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    
    expect(requestMessageShare(user1.token, -100, '', channel1.channelId, -1)).toEqual(400);
  });

  test('Unathorised user ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user2.token, 'channel2', true);
    

    expect(requestMessageShare(user2.token, message1.messageId, '', channel2.channelId, -1)).toEqual(400);
  });

  test('message is more than 1000 characters', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    const channel2 = requestChannelsCreate(user1.token, 'channel2', true);

    expect(requestMessageShare(user1.token, message1.messageId, `test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test
    test test test test test test test test test test test test test test test test test test test test test t`, channel2.channelId, -1)).toEqual(400);
  });

  test('Unathorised user ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    

    expect(requestMessageShare(user2.token, message1.messageId, '', channel1.channelId, -1)).toEqual(400);
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
    const channel2 = requestChannelsCreate(user2.token, 'channel2', true);
    requestMessageShare(user2.token, message1.messageId, 'shared', channel2.channelId, -1);

    const messageInfo = requestChannelMessages(user1.token, channel2.channelId, 0);
    expect(messageInfo.messages[0].message).toStrictEqual('test shared');
  });

  test('shared message through dm', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const uIds = [user2.authUserId, user3.authUserId];
    const dm1 = requestDmCreate(user1.token, uIds);
    const channel1 = requestChannelsCreate(user2.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageShare(user1.token, message1.messageId, 'shared', -1, dm1.dmId);

    const messageInfo = requestDmMessages(user1.token, dm1.dmId, 0);
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

    expect(requestMessageReact(test, message1.messageId, 1)).toEqual(403);
  });

  test('ogMessageId is invalid ', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    
    expect(requestMessageReact(user1.token, -100, 1)).toEqual(400);
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
  test('Already reacted ', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    const message1 = requestMessageSend(user1.token, channel1.channelId, 'test');
    requestMessageReact(user1.token, message1.messageId, 1);
    
    const messageInfo = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(messageInfo.messages[0].reacts[0]).toStrictEqual(user1.uId);
  });
  
});