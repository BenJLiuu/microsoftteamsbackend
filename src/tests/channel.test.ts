import {
  requestAuthRegister, requestClear, requestChannelsCreate, requestChannelDetails,
  requestMessageSend, requestChannelInvite, requestChannelJoin, requestChannelLeave,
  requestChannelRemoveOwner, requestChannelAddOwner, requestChannelMessages
} from './httpHelper';

import { getUserIdFromToken } from './../helper';

describe('ChannelMessages', () => {
  beforeEach(() => {
    requestClear();
  });

  // TESTS HAVE BEEN COMBINED TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    // Invalid channel id
    expect(requestChannelMessages(user1.token, channel1.channelId + 1, 0)).toEqual(400);
    // Start is greater than total messages
    expect(requestChannelMessages(user1.token, channel1.channelId, 2)).toEqual(400);

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    // User is not a channel member
    expect(requestChannelMessages(user2.token, channel1.channelId, 0)).toEqual(400);

    // Invalid token
    expect(requestChannelMessages(user1.token + 'a', channel1.channelId, 0)).toEqual(403);
  });

  test('Empty channel', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  /* These tests utilise the requestMessageSend helper function to test the
     functionality of requestChannelMessages. This is white-box testing, so it has
     been commented out, but if the helper function and these tests are uncommented
     they will pass. */

  test('Success, less than 50 messages, and more than 50 messages', () => {
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
          reacts: [],
          isPinned: false,
        },
        {
          messageId: expect.any(Number),
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: expect.any(Number),
          uId: user1.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    for (let i = 0; i < 50; i++) {
      requestMessageSend(user1.token, channel1.channelId, 'hello' + i);
    }
    expect(requestChannelMessages(user1.token, channel1.channelId, 2)).toEqual({
      messages: expect.any(Array),
      start: 2,
      end: 52,
    });
    expect(requestChannelMessages(user1.token, channel1.channelId, 2).messages).toHaveLength(50);
  });
});

// requestChannelInvite tests

describe('requestChannelInvite', () => {
  beforeEach(() => {
    requestClear();
  });

  // Error tests

  // TESTS HAVE BEEN COMBINED TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    // Invalid channel id
    expect(requestChannelInvite(user1.token, 0, user2.authUserId)).toEqual(400);

    // Invalid inviting user id
    const channel1 = requestChannelsCreate(user2.token, 'channel1', true);
    expect(requestChannelInvite(user1.token, channel1.channelId, user1.authUserId + 1)).toEqual(400);

    // Test uId is already a member
    expect(requestChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toEqual(400);

    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    // Test onlt auth user is not a member
    expect(requestChannelInvite(user1.token, channel1.channelId, user3.authUserId)).toEqual(400);

    // Test invalid token
    expect(requestChannelInvite('test', channel1.channelId, user2.authUserId)).toEqual(403);
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

          profileImgUrl: expect.any(String),

        }],

        allMembers: [{

          uId: user1.authUserId,

          nameFirst: 'John',

          nameLast: 'Smith',

          email: 'johnS@email.com',

          handleStr: 'johnsmith',

          profileImgUrl: expect.any(String),

        },

        {

          uId: user2.authUserId,

          nameFirst: 'Alice',

          nameLast: 'Person',

          email: 'aliceP@fmail.au',

          handleStr: 'aliceperson',

          profileImgUrl: expect.any(String),

        }],
      });
  });
});

// requestChannelDetails tests

describe('Test requestChannelDetails', () => {
  beforeEach(() => {
    requestClear();
  });

  // TESTS HAVE BEEN COMBINED TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    // Invalid channel id
    expect(requestChannelDetails(user1.token, -1)).toEqual(400);

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);
    // Test only authorised user Id is not a member
    expect(requestChannelDetails(user2.token, channel1.channelId)).toEqual(400);

    // Invalid token
    expect(requestChannelDetails(user1.token + 'a', channel1.channelId)).toEqual(403);
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
          profileImgUrl: expect.any(String),
        }],
        allMembers: [{
          uId: user1.authUserId,
          nameFirst: 'John',
          nameLast: 'Smith',
          email: 'johnS@email.com',
          handleStr: 'johnsmith',
          profileImgUrl: expect.any(String),
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

    expect(requestChannelJoin(user1.token, 0)).toEqual(400);
  });

  test('Authorised user is already a member of the channel', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    requestChannelJoin(user2.token, channel1.channelId);

    expect(requestChannelJoin(user2.token, channel1.channelId)).toEqual(400);
  });

  test('Channel is private and user is not member or global owner', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'example', false);

    expect(requestChannelJoin(user2.token, channel1.channelId)).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    expect(requestChannelJoin('test', channel1.channelId)).toEqual(403);
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

            profileImgUrl: expect.any(String),

          }

        ],

        allMembers: [

          {

            uId: user1.authUserId,

            nameFirst: 'Johnny',

            nameLast: 'Lawrence',

            email: 'johnL@gmail.com',

            handleStr: 'johnnylawrence',

            profileImgUrl: expect.any(String),

          },

          {

            uId: user2.authUserId,

            nameFirst: 'Walt',

            nameLast: 'White',

            email: 'walter@gmail.com',

            handleStr: 'waltwhite',

            profileImgUrl: expect.any(String),

          }

        ],

      });
  });
});

// channelRemoveOwner tests
describe('requestChannelRemoveOwner Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  // ERROR CASES HAVE BEEN COMBINED TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestChannelJoin(user2.token, channel1.channelId);
    requestChannelAddOwner(user1.token, channel1.channelId, user2.uId);

    // Invalid channel id
    expect(requestChannelRemoveOwner(user1.token, -10, user2.uId)).toEqual(400);
    // Invalid user id
    expect(requestChannelRemoveOwner(user1.token, channel1.channelId, -10)).toEqual(400);

    // User being removed is not an owner
    expect(requestChannelRemoveOwner(user1.token, channel1.channelId, user2.uId)).toEqual(400);

    // User is the only owner
    const channel2 = requestChannelsCreate(user1.token, 'channel 2', true);
    expect(requestChannelRemoveOwner(user1.token, channel2.channelId, user1.uId)).toEqual(400);
    // Iser is not a member of the channel
    expect(requestChannelRemoveOwner(user1.token, channel1.channelId, user2.uId)).toEqual(400);

    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    // User is not authorised
    expect(requestChannelRemoveOwner(user3.token, channel1.channelId, user2.uId)).toEqual(400);

    // Invalid token
    expect(requestChannelRemoveOwner('test', channel1.channelId, user2.uId)).toEqual(403);
  });

  // Sucessful channelRemoveOwner test
  test('Sucessfully removed owner', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    requestChannelJoin(user2.token, channel1.channelId);

    const user2AuthUId = getUserIdFromToken(user2.token);
    requestChannelAddOwner(user1.token, channel1.channelId, user2AuthUId);
    const userAuthUId = getUserIdFromToken(user1.token);
    requestChannelRemoveOwner(user2.token, channel1.channelId, userAuthUId);

    expect(requestChannelDetails(user2.token, channel1.channelId)).toStrictEqual(

      {

        name: 'channel1',

        isPublic: true,

        ownerMembers: [{

          uId: user2.authUserId,

          nameFirst: 'Alice',

          nameLast: 'Person',

          email: 'aliceP@fmail.au',

          handleStr: 'aliceperson',

          profileImgUrl: expect.any(String),

        }],

        allMembers: [{

          uId: user1.authUserId,

          nameFirst: 'John',

          nameLast: 'Smith',

          email: 'johnS@email.com',

          handleStr: 'johnsmith',

          profileImgUrl: expect.any(String),

        },

        {

          uId: user2.authUserId,

          nameFirst: 'Alice',

          nameLast: 'Person',

          email: 'aliceP@fmail.au',

          handleStr: 'aliceperson',

          profileImgUrl: expect.any(String),

        }]
      });
  });
});

describe('requestChannelAddOwner Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  // ERROR CASES HAVE BEEN COMBINED TO SPEED UP TESTS
  test('All error cases', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);
    requestChannelJoin(user2.token, channel1.channelId);

    // Invalid channel id
    expect(requestChannelAddOwner(user1.token, -10, user2.uId)).toEqual(400);

    // Invalid uid
    expect(requestChannelAddOwner(user1.token, channel1.channelId, -10)).toEqual(400);

    const channel2 = requestChannelsCreate(user1.token, 'channel2', true);
    // User is not a member of the channel
    expect(requestChannelAddOwner(user1.token, channel2.channelId, user2.uId)).toEqual(400);

    // User is already owner
    expect(requestChannelAddOwner(user1.token, channel1.channelId, user2.uId)).toEqual(400);

    // User is member but not authorised
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    requestChannelJoin(user3.token, channel2.channelId);
    const user4 = requestAuthRegister('another@gmail.com', 'password123', 'AAAAAAA', 'BBBBBBBB');
    expect(requestChannelAddOwner(user3.token, channel1.channelId, user4.uId)).toEqual(400);

    // Invalid token
    expect(requestChannelAddOwner('test', channel1.channelId, user2.uId)).toEqual(403);
  });

  test('Sucessfully added owner', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    requestChannelJoin(user2.token, channel1.channelId);

    const authUId = getUserIdFromToken(user2.token);

    requestChannelAddOwner(user1.token, channel1.channelId, authUId);

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

          profileImgUrl: expect.any(String),

        },
        {

          uId: user2.authUserId,

          nameFirst: 'Alice',

          nameLast: 'Person',

          email: 'aliceP@fmail.au',

          handleStr: 'aliceperson',

          profileImgUrl: expect.any(String),

        }],

        allMembers: [{

          uId: user1.authUserId,

          nameFirst: 'John',

          nameLast: 'Smith',

          email: 'johnS@email.com',

          handleStr: 'johnsmith',

          profileImgUrl: expect.any(String),

        },

        {

          uId: user2.authUserId,

          nameFirst: 'Alice',

          nameLast: 'Person',

          email: 'aliceP@fmail.au',

          handleStr: 'aliceperson',

          profileImgUrl: expect.any(String),

        }]
      });
  });
});

// channelLeave error tests
describe('requestChannelLeave Tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid channelId', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestChannelLeave(user1.token, -10)).toEqual(400);
  });

  test('Invalid channelId', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestChannelLeave(user2.token, channel1.channelId)).toEqual(400);
  });

  test('Invalid token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = requestChannelsCreate(user1.token, 'general', true);

    expect(requestChannelLeave('test', channel1.channelId)).toEqual(403);
  });

  // Sucessful channelLeave test
  test('Successful Leave', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');

    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const channel1 = requestChannelsCreate(user1.token, 'channel1', true);

    requestChannelJoin(user2.token, channel1.channelId);

    requestChannelLeave(user2.token, channel1.channelId);

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

          profileImgUrl: expect.any(String),

        }],

        allMembers: [{

          uId: user1.authUserId,

          nameFirst: 'John',

          nameLast: 'Smith',

          email: 'johnS@email.com',

          handleStr: 'johnsmith',

          profileImgUrl: expect.any(String),

        }],
      });
  });
});
