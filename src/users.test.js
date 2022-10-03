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
