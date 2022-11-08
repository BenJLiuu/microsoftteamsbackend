import {
  requestAuthRegister, requestDmCreate, requestDmList, requestDmLeave,
  requestDmDetails, requestDmMessages, requestDmRemove, requestClear
} from './httpHelper';

// DmCreate V1 Testing

describe('requestDmCreate', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid user id with sole user', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    expect(requestDmCreate(user1.token, [user2.authUserId + 1])).toEqual(400);
  });

  test('Invalid user id with multiple user', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    expect(requestDmCreate(user1.token, [user2.authUserId, user2.authUserId + 1, user3.authUserId])).toEqual(400);
  });

  test('Duplicate user id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    expect(requestDmCreate(user1.token, [user2.authUserId, user3.authUserId, user3.authUserId])).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestDmCreate('test', [user1.authUserId])).toEqual(403);
  });

  test('Successful create', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    const dm1 = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);

    expect(requestDmList(user1.token)).toStrictEqual(
      {
        dms: [
          {
            dmId: dm1.dmId,

            name: 'aliceperson, johnnylawrence, johnnymate',
          }
        ],
      });
  });
});

// DmList V1 Testing

describe('requestDmList', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');

    expect(requestDmList(user1.token + 1)).toEqual(403);
  });

  test('Successful create with multiple dms', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const user3 = requestAuthRegister('johnnymate@gmail.com', 'password123', 'Johnny', 'Mate');

    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    const dm2 = requestDmCreate(user1.token, [user3.authUserId]);
    const dm3 = requestDmCreate(user1.token, []);

    expect(requestDmList(user1.token)).toStrictEqual(
      {
        dms: [
          {
            dmId: dm1.dmId,

            name: 'aliceperson, johnnylawrence',
          },
          {
            dmId: dm2.dmId,

            name: 'johnnylawrence, johnnymate',
          },
          {
            dmId: dm3.dmId,

            name: 'johnnylawrence',
          }
        ],
      });
  });
});

// DmLeave V1 Testing

describe('requestDmLeave', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);

    expect(requestDmLeave(user1.token, dm1.dmId + 1)).toEqual(400);
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);

    expect(requestDmLeave(user2.token, dm1.dmId)).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);

    expect(requestDmLeave('test', dm1.dmId)).toEqual(403);
  });

  test('Successful leave', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');

    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);

    requestDmLeave(user2.token, dm1.dmId);
    expect(requestDmDetails(user1.token, dm1.dmId)).toStrictEqual(
      {
        name: 'aliceperson, johnnylawrence',
        members: [
          {
            uId: 0,
            nameFirst: 'Johnny',
            nameLast: 'Lawrence',
            email: 'johnL@gmail.com',
            handleStr: 'johnnylawrence'
          }
        ]
      });
  });
});

// DmDetails V1 Testing

describe('requestDmDetails', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmDetails(user1.token, dm1.dmId + 1)).toEqual(400);
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmDetails(user2.token, dm1.dmId)).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmDetails('test', dm1.dmId)).toEqual(403);
  });

  test('Successful details', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    expect(requestDmDetails(user1.token, dm1.dmId)).toStrictEqual(
      {
        name: expect.any(String),
        members: expect.any(Array)
      }
    );
  });
});

// DmMessages V1 Testing

describe('requestDmMessages', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user1.token, dm1.dmId + 1, 0)).toEqual(400);
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user2.token, dm1.dmId, 0)).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages('test', dm1.dmId, 0)).toEqual(403);
  });

  test('Start is greater than total messages', () => {
    const user1 = requestAuthRegister('johnS@email.com', 'passJohn', 'John', 'Smith');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user1.token, dm1.dmId, 10)).toEqual(400);
  });

  test('Successful messages', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmMessages(user1.token, dm1.dmId, 0)).toStrictEqual(
      {
        messages: expect.any(Array),
        start: 0,
        end: -1
      }
    );
  });
});

// DmRemove V1 Testing

describe('requestDmRemove', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Invalid DM id', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmRemove(user1.token, dm1.dmId + 1)).toEqual(400);
  });

  test('Authorised user is not a member of the DM', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmRemove(user2.token, dm1.dmId)).toEqual(400);
  });

  test('Authorised user is in the DM, but not the creator', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, [user2.token]);
    expect(requestDmRemove(user2.token, dm1.dmId)).toEqual(400);
  });

  test('Invalid Token', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const dm1 = requestDmCreate(user1.token, []);
    expect(requestDmRemove('test', dm1.dmId)).toEqual(403);
  });

  test('Successful removal', () => {
    const user1 = requestAuthRegister('johnL@gmail.com', 'password123', 'Johnny', 'Lawrence');
    const user2 = requestAuthRegister('aliceP@fmail.au', 'alice123', 'Alice', 'Person');
    const dm1 = requestDmCreate(user1.token, [user2.authUserId]);
    requestDmRemove(user1.token, dm1.dmId);
    expect(requestDmList(user1.token)).toStrictEqual({ dms: [] });
  });
});
