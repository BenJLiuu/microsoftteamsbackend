import { authLoginV1, authRegisterV1 } from './auth';
import { clearV1 } from './other'

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