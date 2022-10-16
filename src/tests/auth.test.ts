import request from 'sync-request';
import { port, url } from './../config.json';
const SERVER_URL = `${url}:${port}`;

// TEST REQUEST WRAPPERS
function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v2',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v2',
    {
      json: {
        email,
        password,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v2',
    {},
  );
  return;
}

function requestUserProfile(authUserId: number, uId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/user/profile/v2',
    {
      json: {
        authUserId,
        uId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('Test requestAuthRegister ', () => {
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
    expect(requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate')).toEqual({ authUserId: expect.any(Number) });
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

// requestAuthLogin tests
describe('Test requestAuthLogin ', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Successful login', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user1login = requestAuthLogin('johnS@email.com', 'passJohn');
    const user2login = requestAuthLogin('aliceP@fmail.au', 'alice123');
    expect(user1login.authUserId).toStrictEqual(user1.authUserId);
    const user3 = requestAuthRegister('jamieS@later.co', '&##@P', 'Jamie', 'Son');
    const user3login = requestAuthLogin('jamieS@later.co', '&##@P');
    expect(user2login.authUserId).toStrictEqual(user2.authUserId);
    expect(user3login.authUserId).toStrictEqual(user3.authUserId);
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
