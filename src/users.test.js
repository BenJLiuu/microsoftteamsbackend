import { clearV1 } from './other.js'
import { authRegisterV1 } from './auth.js';
import { validUserId } from './users.js';

describe('Test validUserId ', () => {
  beforeEach(() => {
    clearV1();
  });

  test('has valid user', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(validUserId(user1.uId)).toBe(true);
  });

  test('fails with no users', () => {
    expect(validUserId(0)).toBe(false);
  });

  test('fails with invalid user', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(validUserId(user1.uId + 1)).toBe(false);
  });

  test('has valid user with multiple users', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = authRegisterV1('jamieS@later.co', '&##@P', 'Jamie', 'Son');
    expect(validUserId(user1.uId)).toBe(true);
    expect(validUserId(user2.uId)).toBe(true);
    expect(validUserId(user3.uId)).toBe(true);
  });
});

describe ('userProfileV1', () => {
  beforeEach(() => {
    clearV1();
  });
  
  test('authUserId is invalid', () => {
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(userProfile(user1.authUserId, user2.uId)).toStrictEqual({error: 'authUserId is invalid.'});
  });

  test('uId does not refer to a valid user', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    expect(userProfile(user1.authUserId, user2.uId)).toStrictEqual({error: 'uId does not refer to a valid user.'});
  })

  test('Returns user object for a valid user', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(userProfile(user1.authUserId, user2.uId)).toStrictEqual([
      {
        uId: user2.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
      },
    ]);
  });

  test('Returns user object for multiple valid users', () => {
    const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(userProfile(user1.authUserId, user2.authUserId)).toStrictEqual([
      {
        uId: user2.authUserId,
        nameFirst: 'Alice',
        nameLast: 'Person',
        email: 'aliceP@fmail.au',
        handleStr: 'aliceperson',
      },
    ]);
    expect(userProfile(user2.authUserId, user1.authUserId)).toStrictEqual([
      {
        uId: user1.authUserId,
        nameFirst: 'John',
        nameLast: 'Smith',
        email: 'johnS@email.com',
        handleStr: 'johnsmith',
      },
    ]);
  });
});
