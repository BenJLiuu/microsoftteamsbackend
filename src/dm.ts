import { getData, setData } from './dataStore';
import { validUserId, validToken, getUserIdFromToken, gethandleStrFromId, validDmId, checkUserIdtoDm, removePassword } from './helper';
import { Error, dmId, dmList } from './objects';

/**
  * Creates and stores a new DM.
  *
  * @param {string} token - Token of user creating the dm.
  * @param {array} uIds - Array of user ids, reffering to users added to the dm.
  *
  * @returns {error: 'Invalid User Id.'}  - any uId in arrray does not correspond to an existing user.
  * @returns {error: 'Duplicate User Id found.'} - duplicate user id found in uIds array.
  * @returns {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {integer} dmId - if creation is successfull.
*/
export function dmCreateV1(token: string, uIds: Array<number>): dmId | Error {
  if (!validToken(token)) return { error: 'Invalid Token.' };
  for (const i of uIds) {
    if (!validUserId(i)) return { error: 'Invalid User Id given.' };
  }
  if (uIds.length !== Array.from(new Set(uIds)).length) return { error: 'Duplicate User Id found.' };

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  const names = [];
  const members = [];

  names.push(gethandleStrFromId(authUserId));
  members.push(removePassword(data.users.find(user => user.uId === authUserId)));
  if (uIds.length !== 0) {
    for (const uId of uIds) {
      members.push(removePassword(data.users.find(user => user.uId === uId)));
      names.push(gethandleStrFromId(uId));
    }
  }

  names.sort(function(a, b) {
    return a.localeCompare(b);
  });

  const name = names.join(', ');
  let newdmId = 0;
  while (data.dms.some(c => c.dmId === newdmId)) newdmId++;
  const newDm = {
    dmId: newdmId,
    name: name,
    members: members,
    messages: []
  };

  data.dms.push(newDm);
  setData(data);

  return { dmId: newDm.dmId };
}

/**
  * Lists all DMs that the user is a member of.
  *
  * @param {string} token - Token of user checking each dm.
  *
  * @returns {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {array} dms - array of objects containing information about each dm.
*/
export function dmListV1(token: string): dmList | Error {
  if (!validToken(token)) return { error: 'Invalid Token.' };

  const data = getData();
  const dmList = [];
  const authUserId = getUserIdFromToken(token);
  for (const i of data.dms) {
    if (checkUserIdtoDm(authUserId, i.dmId)) {
      dmList.push({
        dmId: i.dmId,
        name: i.name
      });
    }
  }

  return { dms: dmList };
}

/**
  * Removes the user from a chosen DM.
  *
  * @param {string} token - Token of user leaving the dm.
  * @param {number} dmId - Id of the DM that the user wants to leave.
  *
  * @returns {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {} - DM has been succesfully left.
*/
export function dmLeaveV1(token: string, dmId: number): Record<string, never> | Error {
  if (!validDmId(dmId)) return { error: 'Invalid DM Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the DM.' };

  const data = getData();
  const position = data.dms.findIndex(dm => dm.dmId === dmId);
  const dmIndex = data.dms[position].members.findIndex(user => user.uId === authUserId);
  data.dms[position].members.splice(dmIndex, 1);

  setData(data);

  return {};
}
