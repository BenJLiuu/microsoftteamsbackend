import { channelInviteV1, channelDetailsV1, channelJoinV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';

// channelInviteV1 tests
describe('Test channelInviteV1', () => {
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
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    expect(channelInviteV1(user1.authUserId, channel1.channelId, 'test')).toStrictEqual({ error: 'Invalid User Id.' });
  });
    
  test('Test only user Id is already a member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    channelJoinV1(user2, channel1);
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

// channelDetailsV1 tests
describe('Test channelDetailsV1', () => {
  beforeEach(() => {
    clearV1();
  });

  // Error tests.

  test('Test only invalid channel Id', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    expect(channelDetailsV1(user1, 'test')).toStrictEqual({ error: 'Invalid Channel Id.' });
  });

  test('Test only authorised user Id is not a member', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    expect(channelInviteV1(user2, channel1)).toStrictEqual({ error: 'Authorised User is not a member.' });
  });
    
  test('Test only invalid authorised user Id', () => {
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    expect(channelInviteV1('test', channel1)).toStrictEqual({ error: 'Invalid Authorised User Id.' });
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
    