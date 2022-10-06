import { clearV1 } from './other.js'
import { authRegisterV1 } from './auth.js';
<<<<<<< src/users.test.js
import { userProfileV1 } from './users.js';
=======
import { validUserId, userProfileV1 } from './users.js';

describe('Test validUserId ', () => {
  beforeEach(() => {
    clearV1();
  });

  test('has valid user', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(validUserId(user1.authUserId)).toBe(true);
  });

  test('fails with no users', () => {
    expect(validUserId(0)).toBe(false);
  });

  test('fails with invalid user', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(validUserId(user1.authUserId + 1)).toBe(false);
  });

  test('has valid user with multiple users', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = authRegisterV1('jamieS@later.co', '&##@Ppassword', 'Jamie', 'Son');
    expect(validUserId(user1.authUserId)).toBe(true);
    expect(validUserId(user2.authUserId)).toBe(true);
    expect(validUserId(user3.authUserId)).toBe(true);
  });
});
>>>>>>> src/users.test.js

describe ('userProfileV1', () => {
  beforeEach(() => {
    clearV1();
  });
  
  test('authUserId is invalid', () => {
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(userProfileV1(0, user2.authUserId)).toStrictEqual({error: 'authUserId is invalid.'});
  });

  test('uId does not refer to a valid user', () => {
    const user1 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(userProfileV1(user1.authUserId, 0)).toStrictEqual({error: 'uId does not refer to a valid user.'});
  })

  test('Returns user object for a valid user', () => {
    clearV1();
    const user1 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = authRegisterV1('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(userProfileV1(user2.authUserId, user1.authUserId)).toStrictEqual({
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
    clearV1();
    const user1 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user2 = authRegisterV1('johnmate@gmail.com', 'password123', 'John', 'Mate');
    expect(userProfileV1(user1.authUserId, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        nameFirst: 'John',
        nameLast: 'Mate',
        email: 'johnmate@gmail.com',
        handleStr: 'johnmate',
      },
    });
    expect(userProfileV1(user2.authUserId, user1.authUserId)).toStrictEqual({
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
