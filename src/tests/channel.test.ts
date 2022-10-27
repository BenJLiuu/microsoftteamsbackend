import {
  requestAuthRegister, requestClear, requestChannelsCreate, requestChannelDetails,
  requestMessageSend, requestChannelInvite, requestChannelJoin, requestChannelLeave,
  requestChannelRemoveOwner, requestChannelAddOwner, requestChannelMessages
} from './httpHelper';

describe('ChannelMessages', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Not valid channelId', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user1.token, channel1.channelId + 1, 0)).toStrictEqual({ error: 'Not valid channelId' });
  });

  test('Start is greater than total messages', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user1.token, channel1.channelId, 2)).toStrictEqual({ error: 'Start is greater than total messages' });
  });

  test('Authorised user is not a channel member', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user2.token, channel1.channelId, 0)).toStrictEqual({ error: 'Authorised user is not a channel member' });
  });

  test('Empty channel', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: 0,
    });
  });

  /* These tests utilise the requestMessageSend helper function to test the
   functionality of requestChannelMessages. This is white-box testing, so it has
   been commented out, but if the helper function and these tests are uncommented
   they will pass. */

  test('Authorised user is invalid', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestMessageSend(user1.token, channel1.channelId, 'hello');
    expect(requestChannelMessages(user1.token + 'a', channel1.channelId, 0)).toStrictEqual({ error: 'Invalid Session.' });
  });

  test('Success, less than 50 messages.', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    requestMessageSend(user1.token, channel1.channelId, 'hello');
    requestMessageSend(user1.token, channel1.channelId, 'hello');
    requestMessageSend(user1.token, channel1.channelId, 'hello');
    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toEqual({
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
      requestMessageSend(user1.token, channel1.channelId, 'hello');
    }

    expect(requestChannelMessages(user1.token, channel1.channelId, 5)).toEqual({
      messages: expect.any(Array),
      start: 5,
      end: 55,
    });
  });
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

  test('Successful Registration', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);

    expect(requestChannelDetails(user2.token, channel1.channelId)).toStrictEqual(

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

// requestChannelDetails tests

describe('Test requestChannelDetails', () => {
  beforeEach(() => {
    requestClear();
  });

  // Error tests

  test('Test only invalid channel Id', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    expect(requestChannelDetails(user1.token, -1)).toStrictEqual({ error: 'Invalid Channel Id.' });
  });

  test('Test only authorised user Id is not a member', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelDetails(user2.token, channel1.channelId)).toStrictEqual({ error: 'Authorised User is not a member.' });
  });

  test('Test only invalid token', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelDetails(user1.token + 'a', channel1.channelId)).toStrictEqual({ error: 'Invalid Session Id.' });
  });

  // Successful Registration tests

  test('Successful Registration', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual(
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

    expect(requestChannelJoin(user2.token, channel1.channelId)).toStrictEqual({ error: 'You do not have access to this channel.' });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const channel1 = requestChannelsCreate(user1.token, 'example', true);

    expect(requestChannelJoin('test', channel1.channelId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful join', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    const user2 = requestAuthRegister('walter@gmail.com', 'white123', 'Walt', 'White');

    expect(requestChannelJoin(user2.token, channel1.channelId)).toStrictEqual({});

    expect(requestChannelDetails(user1.token, channel1.channelId)).toStrictEqual(

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
  describe('requestChannelLeave Tests', () => {
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
