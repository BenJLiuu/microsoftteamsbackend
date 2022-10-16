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

function requestClear() {
  return requestHelper('DELETE', '/clear/v2', {});
}

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', { email, password, nameFirst, nameLast });
}

describe('Test clearV1 ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('authLogin error, user data cleared', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestAuthRegister('jamieS@later.co', '&##@P', 'Jamie', 'Son');
    requestClear();
    expect(requestAuthLogin('johnS@email.com', 'passJohn')).toStrictEqual({ error: 'Email Not Found.' });
    expect(requestAuthLogin('aliceP@fmail.au', 'alice123')).toStrictEqual({ error: 'Email Not Found.' });
    expect(requestAuthLogin('jamieS@later.co', '&##@P')).toStrictEqual({ error: 'Email Not Found.' });
  });

  /* test('channelListAll error, channel data cleared', () => {
    const channel1 = channelsCreateV1(user1, 'channel1', true);
    const channel2 = channelsCreateV1(user2, 'channel2', false);
    const channel3 = channelsCreateV1(user2, 'channel3', true);
    const channel4 = channelsCreateV1(user3, 'channel%$#', true);
    requestClear();
    expect(channelsListAllV1(user1)).toStrictEqual('uId not found.');
    expect(channelsListAllV1(user2)).toStrictEqual('uId not found.');
    expect(channelsListAllV1(user3)).toStrictEqual('uId not found.');
  });

  test('channelMessages error, message data cleared',() => {
    const channel3 = channelsCreateV1(user3, 'channel3', true);
    channelJoinV1(user1, channel3);
    channelJoinV1(user2, channel3);
    requestClear();
    expect(channelMessagesV1(user1, channel3, 0).toStrictEqual('uId not found.'));
    expect(channelMessagesV1(user2, channel3, 0).toStrictEqual('uId not found.'));
    expect(channelMessagesV1(user3, channel3, 0).toStrictEqual('uId not found.'));
  }); */
});
