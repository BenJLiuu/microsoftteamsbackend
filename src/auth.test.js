import { authLoginV1, authRegisterV1 } from './auth';
import { clearV1 } from './other';
// authRegisterV1 tests

// Error tests.
  test('Test only invalid email', () => {
    expect(authRegisterV1('@bob@.org.org', 'pass123', 'Bob', 'Smith')).toEqual({ error: 'Invalid Email Address.' });
    });
    
    test('Test only email already in use', () => {
      const user1 = authRegisterV1('Ben10@gmail.com', 'password', 'Ben', 'Ten');
      expect(authRegisterV1('Ben10@gmail.com', 'pass123', 'Bob', 'Smith')).toEqual({ error: 'Email Already in Use.' });
      });
      
    test('Test only password too short', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'abc3', 'Bob', 'Smith')).toEqual({ error: 'Password too Short.' });
      });
      
    test('Test only first name too long', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'Smith')).toEqual({ error: 'Invalid First Name.' });
      });
      
    test('Test only first name too short', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', '', 'Smith')).toEqual({ error: 'Invalid First Name.' });
      });
      
    test('Test only last name too long', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bob', 'Smithhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')).toEqual({ error: 'Invalid Last Name' });
      });
      
    test('Test only last name too short', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bob', '')).toEqual({ error: 'Invalid Last Name' });
      });

// Successful Registration tests

    test('Successful Registration', () => {
      expect(authRegisterV1('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate')).toEqual({ authUserId });
    });
    
    
// authLoginV1 tests

describe('Test authLoginV1 ', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Successful login', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(authLoginV1('johnS@email.com', 'passJohn').authUserId).toStrictEqual(user1.authUserId);
    const user3 = authRegisterV1('jamieS@later.co', '&##@P', 'Jamie', 'Son');
    expect(authLoginV1('aliceP@fmail.au', 'alice123').authUserId).toStrictEqual(user2.authUserId);
    expect(authLoginV1('jamieS@later.co', '&##@P').authUserId).toStrictEqual(user3.authUserId);
  });

  test('Invalid password', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(authLoginV1('johnS@email.com', 'wrongpassword')).toStrictEqual({ error: 'Incorrect Password.' });
    expect(authLoginV1('not@person.co', 'abc123')).toStrictEqual({ error: 'Username Not Found.' });
  });

  test('Invalid email', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(authLoginV1('not@person.co', 'abc123')).toStrictEqual({ error: 'Username Not Found.' });
  });

  test('No users login', () => {
    expect(authLoginV1('not@person.co', 'abc123')).toStrictEqual({ error: 'Username Not Found.' });
  });

  test('Empty string login', () => {
    expect(authLoginV1('', '')).toStrictEqual({ error: 'Username Not Found.' });
  });
});

