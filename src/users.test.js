import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';
import { userProfileV1 } from './users.js';

describe('userProfileV1', () => {
  beforeEach(() => {
    clearV1();
  });

  test('authUserId is invalid', () => {
    const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(userProfileV1(0, user2.authUserId)).toStrictEqual({ error: 'authUserId is invalid.' });
  });

  test('uId does not refer to a valid user', () => {
    const user1 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    expect(userProfileV1(user1.authUserId, 0)).toStrictEqual({ error: 'uId does not refer to a valid user.' });
  });

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
