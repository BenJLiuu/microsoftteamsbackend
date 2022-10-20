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

function requestDmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v1', { token, dmId });
}

function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v1', { token, dmId, start });
}

function requestDmRemove(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v1', { token, dmId });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
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

// DmDetails V1 Testing

describe('requestDmDetails', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmDetails(user1.token, dm1.dmId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmDetails(user2.token, dm1.dmId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmDetails('test', dm1.dmId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful details', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmDetails(user1.token, dm1.dmId)).toStrictEqual(
      { 
        name: expect.any(String),
        members: expect.any(Array)
      }
    );
  });

});

// DmMessages V1 Testing

describe('requestDmMessages', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user1.token, dm1.dmId + 1, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user2.token, dm1.dmId, 0)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages('test', dm1.dmId, 0)).toStrictEqual({ error: expect.any(String) });
  });

  Text('Start is greater than total messages', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user1.token, dm1.dmId, 10)).toStrictEqual({ error: expect.any(String) })
  });

  test('Successful messages', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user1.token, dm1.dmId, 0)).toStrictEqual(
      { 
        messages: expect.any(Array),
        start: 0,
        end: 50
      }
    );
  });


});

// DmRemove V1 Testing

describe('requestDmRemove', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmRemove(user1.token, dm1.dmId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmRemove(user2.token, dm1.dmId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Authorised user is in the DM, but not the creator', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, [user2.token]);
    expect(requestDmRemove(user2.token, dm1.dmId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmRemove('test', dm1.dmId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful removal', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    expect(requestDmRemove(user1.token, dm1.dmId)).toStrictEqual({});
    expect(requestDmList(user1.token)).toStrictEqual({});
  });
});