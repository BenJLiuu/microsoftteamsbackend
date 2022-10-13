import { authLoginV1, authRegisterV1 } from './../auth';
import { clearV1 } from './../other';
import { userProfileV1 } from './../users';
// TEMPORARY WHITE BOX TESTING PRE-HTTP
import { UserOmitPassword, AuthUserId } from './../objects';

// authRegisterV1 tests
describe('Test authRegisterV1 ', () => {
  beforeEach(() => {
    clearV1();
  });

  // Error tests.

  test('Test only invalid email', () => {
    expect(authRegisterV1('@bob@.org.org', 'pass123', 'Bob', 'Smith')).toStrictEqual({ error: 'Invalid Email Address.' });
  });

  test('Test only email already in use', () => {
    authRegisterV1('Ben10@gmail.com', 'password', 'Ben', 'Ten');
    expect(authRegisterV1('Ben10@gmail.com', 'pass123', 'Bob', 'Smith')).toStrictEqual({ error: 'Email Already in Use.' });
  });

  test('Test only password too short', () => {
    expect(authRegisterV1('bobsmith@gmail.com', 'abc3', 'Bob', 'Smith')).toStrictEqual({ error: 'Password too Short.' });
  });

  test('Test only first name too long', () => {
    expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'Smith')).toStrictEqual({ error: 'Invalid First Name.' });
  });

  test('Test only first name too short', () => {
    expect(authRegisterV1('bobsmith@gmail.com', 'pass123', '', 'Smith')).toStrictEqual({ error: 'Invalid First Name.' });
  });

  test('Test only last name too long', () => {
    expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bob', 'Smithhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')).toStrictEqual({ error: 'Invalid Last Name.' });
  });

  test('Test only last name too short', () => {
    expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bob', '')).toStrictEqual({ error: 'Invalid Last Name.' });
  });

  test('Test first name contains invalid characters', () => {
    expect(authRegisterV1('johnnymate@gmail.com', 'password123', 'Joh%$y', 'Mate')).toEqual({ error: 'Invalid First Name.' });
  });

  test('Test last name contains invalid characters', () => {
    expect(authRegisterV1('johnnymate@gmail.com', 'password123', 'Johnny', 'M%$e')).toEqual({ error: 'Invalid Last Name.' });
  });

  // Successful Registration tests

  test('Successful Registration', () => {
    expect(authRegisterV1('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate')).toEqual({ authUserId: expect.any(Number) });
  });

  test('Registration of existing handle', () => {
    const user1 = authRegisterV1('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate') as AuthUserId;
    const user2 = authRegisterV1('johnnymatey@gmail.com', 'password1234', 'Johnny', 'Mate') as AuthUserId;
    const userConfirm = userProfileV1(user1.authUserId, user2.authUserId) as UserOmitPassword;
    expect(userConfirm.user.handleStr).toStrictEqual('johnnymate0');
  });
});

// authLoginV1 tests

describe('Test authLoginV1 ', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Successful login', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person') as AuthUserId;
    const user1login = authLoginV1('johnS@email.com', 'passJohn') as AuthUserId;
    const user2login = authLoginV1('aliceP@fmail.au', 'alice123') as AuthUserId;
    expect(user1login.authUserId).toStrictEqual(user1.authUserId);
    const user3 = authRegisterV1('jamieS@later.co', '&##@P', 'Jamie', 'Son') as AuthUserId;
    const user3login = authLoginV1('jamieS@later.co', '&##@P') as AuthUserId;
    expect(user2login.authUserId).toStrictEqual(user2.authUserId);
    expect(user3login.authUserId).toStrictEqual(user3.authUserId);
  });

  test('Invalid password', () => {
    authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person') as AuthUserId;
    expect(authLoginV1('johnS@email.com', 'wrongpassword')).toStrictEqual({ error: 'Incorrect Password.' });
    expect(authLoginV1('not@person.co', 'abc123')).toStrictEqual({ error: 'Email Not Found.' });
  });

  test('Invalid email', () => {
    authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith') as AuthUserId;
    authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person') as AuthUserId;
    expect(authLoginV1('not@person.co', 'abc123')).toStrictEqual({ error: 'Email Not Found.' });
  });

  test('No users login', () => {
    expect(authLoginV1('not@person.co', 'abc123')).toStrictEqual({ error: 'Email Not Found.' });
  });

  test('Empty string login', () => {
    expect(authLoginV1('', '')).toStrictEqual({ error: 'Email Not Found.' });
  });
});
