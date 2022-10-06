import { channelInviteV1, channelDetailsV1, channelJoinV1, channelMessagesV1, channelSendMessageV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';

describe('channelMessagesV1', () => {
  beforeEach(() => {
    clearV1();
  });
  

  test('Not valid channelId', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelMessagesV1(user1.authUserId, channel1.channelId + 1)).toStrictEqual({error: 'Not valid channelId'});
  });

  test('Start is greater than total messages', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelMessagesV1(user1.authUserId, channel1.channelId, 2)).toStrictEqual({error: 'Start is greater than total messages'});
  });

  test('Authorised user is not a channel member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    expect(channelMessagesV1(user2.authUserId, channel1.channelId, 0)).toStrictEqual({error: 'Authorised user is not a channel member'});
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

  /*test('Authorised user is invalid', () => {
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
  });*/
});

// channelInviteV1 tests
describe('channelInviteV1', () => {
  beforeEach(() => {
    clearV1();
  });

  // Error tests.
  
  test('Test only invalid channel Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(channelInviteV1(user1, 'test', user2)).toStrictEqual({ error: 'Invalid Channel Id.' });
  });
    
  test('Test only invalid user Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    expect(channelInviteV1(user1, channel1, 'test')).toStrictEqual({ error: 'Invalid User Id.' });
  });
    
  test('Test only user Id is already a member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    channelJoinV1(user2.authUserId, channel1.channelId);
    expect(channelInviteV1(user1, channel1, user2)).toStrictEqual({ error: 'User is already a member.' });
  });
    
  test('Test only authorised user Id is not a member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    const user3 = authRegisterV1('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    expect(channelInviteV1(user2, channel1, user3)).toStrictEqual({ error: 'Authorised User is not a member.' });
  });
    
  test('Test only invalid authorised user Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    expect(channelInviteV1('test', channel1, user2)).toStrictEqual({ error: 'Invalid Authorised User Id.' });
  });
    

// Successful Registration tests

  test('Successful Registration', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    channelInviteV1(user1, channel1, user2);
    expect(channelsListV1(user2)).toStrictEqual(
        {
            channelId: channel1,
            name: 'channel1',
        }
    );
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
    expect(channelJoinV1('123132332983', channel1.channelId)).toStrictEqual({ error: 'Invalid User Id.' });
  });
  
  test('Successful join', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    const user2 = authRegisterV1('walter@gmail.com', 'white123', 'Walt', 'White');
    expect(channelJoinV1(user2.authUserId, channel1.channelId)).toStrictEqual( {} );
  });
});

  
    
    
  
