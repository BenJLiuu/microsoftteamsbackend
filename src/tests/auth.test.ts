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

function requestAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v2', { email, password });
}

function requestClear() {
  return requestHelper('DELETE', '/clear/v2', {});
}

function requestUserProfile(authUserId: number, uId: number) {
  return requestHelper('GET', '/user/profile/v2', { authUserId, uId });
}

function requestAuthLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v1', { token });
}

describe('Test authRegister ', () => {
  beforeEach(() => {
    requestClear();
  });

  // Error tests.
  test('Test only invalid email', () => {
    expect(requestAuthRegister('@bob@.org.org', 'pass123', 'Bob', 'Smith')).toStrictEqual({ error: 'Invalid Email Address.' });
  });

  test('Test only email already in use', () => {
    requestAuthRegister('Ben10@gmail.com', 'password', 'Ben', 'Ten');
    expect(requestAuthRegister('Ben10@gmail.com', 'pass123', 'Bob', 'Smith')).toStrictEqual({ error: 'Email Already in Use.' });
  });

  test('Test only password too short', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'abc3', 'Bob', 'Smith')).toStrictEqual({ error: 'Password too Short.' });
  });

  test('Test only first name too long', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', 'Bobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'Smith')).toStrictEqual({ error: 'Invalid First Name.' });
  });

  test('Test only first name too short', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', '', 'Smith')).toStrictEqual({ error: 'Invalid First Name.' });
  });

  test('Test only last name too long', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', 'Bob', 'Smithhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')).toStrictEqual({ error: 'Invalid Last Name.' });
  });

  test('Test only last name too short', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', 'Bob', '')).toStrictEqual({ error: 'Invalid Last Name.' });
  });

  test('Test first name contains invalid characters', () => {
    expect(requestAuthRegister('johnnymate@gmail.com', 'password123', 'Joh%$y', 'Mate')).toEqual({ error: 'Invalid First Name.' });
  });

  test('Test last name contains invalid characters', () => {
    expect(requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'M%$e')).toEqual({ error: 'Invalid Last Name.' });
  });

  // Successful Registration tests

  test('Successful Registration', () => {
    expect(requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate')).toEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      }
    );
  });

  test('Registration of existing handle', () => {
    const user1 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');
    const user2 = requestAuthRegister('johnnymatey@gmail.com', 'password1234', 'Johnny', 'Mate');
    const userConfirm = requestUserProfile(user1.authUserId, user2.authUserId);
    expect(userConfirm).toStrictEqual({
      user: {
        uId: expect.any(Number),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        email: expect.any(String),
        handleStr: 'johnnymate0',
      }
    });
  });
});

describe('Test authLogin ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Successful login', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user1login = requestAuthLogin('johnS@email.com', 'passJohn');
    const user2login = requestAuthLogin('aliceP@fmail.au', 'alice123');
    expect(user1login).toStrictEqual({
      authUserId: user1.authUserId,
      token: expect.any(String),
    });
    const user3 = requestAuthRegister('jamieS@later.co', '&##@PA', 'Jamie', 'Son');
    const user3login = requestAuthLogin('jamieS@later.co', '&##@PA');
    expect(user2login).toStrictEqual({
      authUserId: user2.authUserId,
      token: expect.any(String),
    });
    expect(user3login).toStrictEqual({
      authUserId: user3.authUserId,
      token: expect.any(String),
    });
  });

  test('Login Sessions', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const login1 = requestAuthLogin('johnS@email.com', 'passJohn');
    const login2 = requestAuthLogin('johnS@email.com', 'passJohn');
    const login3 = requestAuthLogin('johnS@email.com', 'passJohn');
    expect(login1.token).not.toBe(login2.token);
    expect(login2.token).not.toBe(login3.token);
  });

  test('Invalid password', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestAuthLogin('johnS@email.com', 'wrongpassword')).toStrictEqual({ error: 'Incorrect Password.' });
    expect(requestAuthLogin('not@person.co', 'abc123')).toStrictEqual({ error: 'Email Not Found.' });
  });

  test('Invalid email', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestAuthLogin('not@person.co', 'abc123')).toStrictEqual({ error: 'Email Not Found.' });
  });

  test('No users login', () => {
    expect(requestAuthLogin('not@person.co', 'abc123')).toStrictEqual({ error: 'Email Not Found.' });
  });

  test('Empty string login', () => {
    expect(requestAuthLogin('', '')).toStrictEqual({ error: 'Email Not Found.' });
  });
});

describe('Test authLogout', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid token', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user1login = requestAuthLogin('johnS@email.com', 'pasJohn');
    expect(requestAuthLogout(user1login.token)).toStrictEqual({ error: 'Invalid token' });
  });

  test('Successfully login', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user1login = requestAuthLogin('johnS@email.com', 'passJohn');
    expect(requestAuthLogout(user1login.token)).toStrictEqual({});
  });

  test('Log off only one token', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user1login1 = requestAuthLogin('johnS@email.com', 'passJohn');
    const user1login2 = requestAuthLogin('johnS@email.com', 'passJohn');
    expect(requestAuthLogout(user1login1.token)).toStrictEqual({});
    expect(requestAuthLogout(user1login1.token)).toStrictEqual({ error: 'Invalid token' });
    expect(requestAuthLogout(user1login2.token)).toStrictEqual({});
    expect(requestAuthLogout(user1login2.token)).toStrictEqual({ error: 'Invalid token' });
  });
});
