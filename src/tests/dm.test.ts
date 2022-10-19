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

function requestDmCreate(token: string, uIds: Array<number, never>) {
  return requestHelper('POST', '/dm/create/v1', { token, uIds });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v2', {});
}

// DmCreate V1 Testing

describe('requestDmCreate', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid user id with sole user', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    expect(requestDmCreate(user1.token, [user2.authUserId + 1])).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid user id with multiple user', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    expect(requestDmCreate(user1.token, [user2.authUserId, user2.authUserId+1, user3.authUserId])).toStrictEqual({ error: expect.any(String) });
  });

  test('Duplicate user id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    expect(requestDmCreate(user1.token, [user2.authUserId, user3.authUserId, user3.authUserId])).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestDmCreate('test', [user1.authUserId])).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful create', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);

    expect(requestDmList(user1.token)).toStrictEqual(
      {
        dms: [
          {
            dmId: dm1.dmId,

            name: 'aliceperson, johnnylawrence, johnnymate',
          }
        ],
      });
  });
});