import {
  requestAuthRegister,
  requestAuthLogin,
  requestClear,
  requestUserProfile,
  requestAuthLogout,
  // requestAuthPasswordResetRequest,
  // requestAuthPasswordResetReset,
} from './httpHelper';

describe('Test authRegister ', () => {
  beforeEach(() => {
    requestClear();
  });

  // Error tests.
  test('Test only invalid email', () => {
    expect(requestAuthRegister('@bob@.org.org', 'pass123', 'Bob', 'Smith')).toEqual(400);
  });

  test('Test only email already in use', () => {
    requestAuthRegister('Ben10@gmail.com', 'password', 'Ben', 'Ten');
    expect(requestAuthRegister('Ben10@gmail.com', 'pass123', 'Bob', 'Smith')).toEqual(400);
  });

  test('Test only password too short', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'abc3', 'Bob', 'Smith')).toEqual(400);
  });

  test('Test only first name too long', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', 'Bobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'Smith')).toEqual(400);
  });

  test('Test only first name too short', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', '', 'Smith')).toEqual(400);
  });

  test('Test only last name too long', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', 'Bob', 'Smithhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')).toEqual(400);
  });

  test('Test only last name too short', () => {
    expect(requestAuthRegister('bobsmith@gmail.com', 'pass123', 'Bob', '')).toEqual(400);
  });

  test('Test first name contains invalid characters', () => {
    expect(requestAuthRegister('johnnymate@gmail.com', 'password123', 'Joh%$y', 'Mate')).toEqual(400);
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
    const user3 = requestAuthRegister('johnnymateyy@gmail.com', 'password12345', 'Johnny', 'Mate');
    const userConfirm = requestUserProfile(user1.token, user2.authUserId);
    const userConfirm2 = requestUserProfile(user1.token, user3.authUserId);
    expect(userConfirm).toStrictEqual({
      user: {
        uId: expect.any(Number),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        email: expect.any(String),
        handleStr: 'johnnymate0',
        profileImgUrl: expect.any(String),
      }
    });
    expect(userConfirm2).toStrictEqual({
      user: {
        uId: expect.any(Number),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        email: expect.any(String),
        handleStr: 'johnnymate1',
        profileImgUrl: expect.any(String),
      }
    });
  });

  test('Test first name contains numbers', () => {
    expect(requestAuthRegister('johnnymate@gmail.com', 'password123', 'J0hnny', 'Mate')).toEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      }
    );
  });

  test('Test last name contains numbers', () => {
    expect(requestAuthRegister('johnnymate@gmail.com', 'password123', 'J0hnny', 'Mate')).toEqual(
      {
        token: expect.any(String),
        authUserId: expect.any(Number)
      }
    );
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
    expect(requestAuthLogin('johnS@email.com', 'wrongpassword')).toEqual(400);
    expect(requestAuthLogin('not@person.co', 'abc123')).toEqual(400);
  });

  test('Invalid email', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(requestAuthLogin('not@person.co', 'abc123')).toEqual(400);
  });

  test('No users login', () => {
    expect(requestAuthLogin('not@person.co', 'abc123')).toEqual(400);
  });

  test('Empty string login', () => {
    expect(requestAuthLogin('', '')).toEqual(400);
  });
});

describe('Test authLogout', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid token', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user1login = requestAuthLogin('johnS@email.com', 'pasJohn');
    expect(requestAuthLogout(user1login.token)).toEqual(403);
  });

  test('Successfully logout', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user1login = requestAuthLogin('johnS@email.com', 'passJohn');
    expect(requestAuthLogout(user1login.token)).toEqual({});
  });

  test('Log off only one token', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user1login1 = requestAuthLogin('johnS@email.com', 'passJohn');
    const user1login2 = requestAuthLogin('johnS@email.com', 'passJohn');
    expect(requestAuthLogout(user1login1.token)).toStrictEqual({});
    expect(requestAuthLogout(user1login1.token)).toEqual(403);
    expect(requestAuthLogout(user1login2.token)).toStrictEqual({});
    expect(requestAuthLogout(user1login2.token)).toEqual(403);
  });
});

/*
describe('Test authPasswordResetRequest', () => {
  beforeEach(() => {
    requestClear();
  });

  test('invalid email', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(requestAuthPasswordResetRequest('johnSS@email.com')).toStrictEqual({});
    expect(requestAuthPasswordResetRequest('..abc.def@mail')).toStrictEqual({});
  });

  test('successful request', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(requestAuthPasswordResetRequest('johnS@email.com')).toStrictEqual({});
  });
});

describe('Test authPasswordResetReset', () => {
  beforeEach(() => {
    requestClear();
  });

  test('New password is too short', () => {
    requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestAuthPasswordResetRequest('johnS@email.com');
    expect(requestAuthPasswordResetReset('valid', 'short')).toEqual(400);
  });

  test('successful reset', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    requestAuthPasswordResetRequest('johnS@email.com');
    expect(requestAuthLogout(user1.token)).toEqual(403);
  });
});
*/
