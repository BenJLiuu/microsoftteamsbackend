import { authLoginV1, authRegisterV1 } from './auth';

test('Test successful echo', () => {
  const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
  const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
  expect(authLoginV1('johnS@email.com', 'passJohn').authUserId === user1.authUserId);
  const user3 = authRegisterV1('jamieS@later.co', '&##@P', 'Jamie', 'Son');
  expect(authLoginV1('aliceP@fmail.au', 'alice123').authUserId === user2.authUserId);
  expect(authLoginV1('jamieS@later.co', '&##@P').authUserId === user3.authUserId);
  
});

test('Test invalid echo', () => {
  const user1 = authRegisterV1('johnS@email.com', 'passJohn', 'John', 'Smith');
  const user2 = authRegisterV1('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
  expect(authLoginV1('johnS@email.com', 'wrongpassword')).toStrictEqual({ error: 'Incorrect Password.' });
  expect(authLoginV1('not@person.co', 'abc123')).toStrictEqual({ error: 'Username Not Found.' });
});
