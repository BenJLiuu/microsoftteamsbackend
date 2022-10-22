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

function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { token, uId });
}

function requestUsersAll(token: string) {
  return requestHelper('GET', '/users/all/v1', { token });
}

function requestUserProfileSetName(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v1', { token, nameFirst, nameLast });
}

function requestUserProfileSetEmail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v1', { token, email });
}

function requestUserProfileSetHandle(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v1', { token, handleStr });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}

describe('Test userProfile', () => {
  beforeEach(() => {
    requestClear();
  });

  test('authUserId is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfile(user1.token + '1', user1.authUserId)).toStrictEqual({ error: 'Invalid Session Id.' });
  });

  test('uId does not refer to a valid user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfile(user1.token, user1.authUserId + 1)).toStrictEqual({ error: 'Invalid User Id.' });
  });

  test('Returns user object for a valid user', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
      },
    });
  });

  test('Returns user object for multiple valid users', () => {
    requestClear();
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUserProfile(user1.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'John',
        nameLast: 'Mate',
        email: 'johnmate@gmail.com',
        handleStr: 'johnmate',
      },
    });
    expect(requestUserProfile(user2.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
      },
    });
  });
});

describe('Test userAll', () => {
  beforeEach(() => {
    requestClear();
  });

  test('session is invalid', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUsersAll(user1.token + '1')).toStrictEqual({ error: 'Invalid Session Id.' });
  });

  test('return one user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
        }
      ]
    });
  });

  test('return array of users', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
        },
        {
          uId: user2.authUserId,
          nameFirst: 'John',
          nameLast: 'Mate',
          email: 'johnmate@gmail.com',
          handleStr: expect.any(String),
        }
      ]
    });
  });
});

// UserProfileSetName tests
describe('Test UserProfileSetName', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid first name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, '', 'Last')).toStrictEqual({ error: 'Invalid First Name.' });
    expect(requestUserProfileSetName(user1.token, 'nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'Last')).toStrictEqual({ error: 'Invalid First Name.' });
  });

  test('invalid last name', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, 'First', '')).toStrictEqual({ error: 'Invalid Last Name.' });
    expect(requestUserProfileSetName(user1.token, 'First', 'nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')).toStrictEqual({ error: 'Invalid Last Name.' });
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token + 'z', 'Jesse', 'Pinkman')).toStrictEqual({ error: 'Invalid Session Id.' });
  });

  test('successful name change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetName(user1.token, 'Jesse', 'Pinkman')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Jesse',
          nameLast: 'Pinkman',
          email: 'aliceP@fmail.au',
          handleStr: expect.any(String),
        }
      ]
    });
  });
});

// UserProfileSetEmail tests
describe('Test userProfileSetEmail', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid email', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token, '.invalid@@..gmail.au.')).toStrictEqual({ error: 'Invalid Email Address.' });
  });

  test('email in use by another user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = requestAuthRegister('bcs@gmail.com', 'bcs123', 'Saul', 'Goodman');
    expect(requestUserProfileSetEmail(user1.token, 'bcs@gmail.com')).toStrictEqual({ error: 'Email Already in Use.' });
    expect(requestUserProfileSetEmail(user2.token, 'aliceP@fmail.au')).toStrictEqual({ error: 'Email Already in Use.' });
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token + 'w', 'validemail@gmail.com')).toStrictEqual({ error: 'Invalid Session Id.' });
  });

  test('successful email change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetEmail(user1.token, 'new1@gmail.com')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'new1@gmail.com',
          handleStr: expect.any(String),
        }
      ]
    });
  });
});

// userProfileSetHandle tests
describe('Test userProfileSetHandle', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid handle (too short/long)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'hi')).toStrictEqual({ error: 'Invalid Handle.' });
    expect(requestUserProfileSetHandle(user1.token, 'aliceeeeeeeeeeeeeeeeeeeeeeeee')).toStrictEqual({ error: 'Invalid Handle.' });
  });

  test('invalid handle (contains non-alphanumeric)', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'alice!@!')).toStrictEqual({ error: 'Invalid Handle.' });
  });

  test('handle in use by another user', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    requestUserProfileSetHandle(user1.token, 'newname');
    const user2 = requestAuthRegister('michael@gmail.com', 'dm123', 'Michael', 'Scott');
    expect(requestUserProfileSetHandle(user2.token, 'newname')).toStrictEqual({ error: 'Handle Already in Use.' });
  });

  test('invalid session', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token + 's', 'kevin')).toStrictEqual({ error: 'Invalid Session Id.' });
  });

  test('successful handle change', () => {
    const user1 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestUserProfileSetHandle(user1.token, 'dwight')).toStrictEqual({});
    expect(requestUsersAll(user1.token)).toStrictEqual({
      users: [
        {
          uId: user1.authUserId,
          nameFirst: 'Alice',
          nameLast: 'Person',
          email: 'aliceP@fmail.au',
          handleStr: 'dwight',
        }
      ]
    });
  });
});
