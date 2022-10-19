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

function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v2', { email, password, nameFirst, nameLast });
}

function requestDmCreate(token: string, uIds: Array<number>) {
  return requestHelper('POST', '/dm/create/v1', { token, uIds });
}

function requestDmList(token: string) {
  return requestHelper('GET', '/dm/list/v1', { token });
}

function requestDmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v1', { token, dmId });
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

    expect(requestDmCreate(user1.token, [user2.authUserId, user2.authUserId + 1, user3.authUserId])).toStrictEqual({ error: expect.any(String) });
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

// DmList V1 Testing

describe('requestDmList', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestDmList(user1.token + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful create with multiple dms', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    const dm2 = requestDmCreate(user1.token, [user3.authUserId]);
    const dm3 = requestDmCreate(user1.token, []);

    expect(requestDmList(user1.token)).toStrictEqual(
      {
        dms: [
          {
            dmId: dm1.dmId,

            name: 'aliceperson, johnnylawrence',
          },
          {
            dmId: dm2.dmId,

            name: 'johnnylawrence, johnnymate',
          },
          {
            dmId: dm3.dmId,

            name: 'johnnylawrence',
          }
        ],
      });
  });
});

// DmLeave V1 Testing

describe('requestDmLeave', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);

    expect(requestDmLeave(user1.token, dm1.dmId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);

    expect(requestDmLeave(user2.token, dm1.dmId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);

    expect(requestDmLeave('test', dm1.dmId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful leave', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    const dm2 = requestDmCreate(user1.token, []);
    expect(requestDmLeave(user1.token, dm1.dmId)).toStrictEqual({});
    expect(requestDmList(user1.token)).toStrictEqual(
      {
        dms: [
          {
            dmId: dm2.dmId,

            name: 'johnnylawrence',
          }
        ],
      });
  });
});
