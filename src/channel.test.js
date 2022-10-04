import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';

// channelJoinV1 tests

describe('Test channelJoinV1 ', () => {
  beforeEach(() => {
    clearV1();
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
  });
  
  test('Invalid channelId', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    expect(channelJoinV1(user1, '13')).toStrictEqual({ error:  'Invalid Channel Id.' });
  });
  
  test('Authorised user already member of channel', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    expect(channelJoinV1(user1, channel1)).toStrictEqual({ error: 'User is already a member.' });
  });
    
  test('Channel is private and user is not member/global owner', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = authRegisterV1('walter@gmail.com', 'white123', 'Walt', 'White');
    const channel2 = channelsCreateV1(user2, 'channel2', false);
    expect(channelJoinV1(user1, channel2)).toStrictEqual({ error: 'You do not have access to this channel.' });
  });
  
  test('Invalid user id', () => {
    expect(channelJoinV1('anything', channel1)).toStrictEqual({ error: 'Invalid User Id.' });
  });
  
  test('Successful join', () => {
    const user1 = authRegisterV1('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    const user2 = authRegisterV1('walter@gmail.com', 'white123', 'Walt', 'White');
    expect(channelJoinV1(user2, channel1)).toStrictEqual( {} );
  });
  
    

