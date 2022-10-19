import { getData, setData } from './dataStore';
import { validUserId, validChannelId, checkUserIdtoChannel, removePassword, validToken, getUserIdFromToken, gethandleStrFromId, validDmId, checkUserIdtoDm } from './helper';
import { Error, MessageList, ChannelDetails, dmId, dms } from './objects';

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
export function DmCreateV1(token: string, uIds: Array<number>): dmId | Error {
  if (!validToken(token)) return { error: 'Invalid Token.' };
  for (const i of uIds) {
    if (!validUserId(i)) return { error: 'Invalid User Id given.' };
  }
  if(uIds.length !== Array.from(new Set(uIds)).length) return { error: 'Duplicate User Id found.' };

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  let names = [];
  let members = [];

  names.push(gethandleStrFromId(authUserId));
  members.push(authUserId);
  if (uIds.length !== 0) {
    for (const i of uIds) {
      names.push(gethandleStrFromId(i));
      members.push(i);
    }
  }
  names.sort(function(a, b) {
    return a.localeCompare(b);
  });

  let name = names.join(', ');
  let newdmId = 0;
  while (data.dms.some(c => c.dmId === newdmId)) newdmId++;
  const newDm = {
    dmId: newdmId,
    name: name,
    members: members,
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
export function DmListV1(token: string): dms | Error {
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
export function DmLeaveV1(token: string, dmId: number): Record<string, never> | Error {
  if (!validDmId(dmId)) return { error: 'Invalid DM Id.' };
  if (!validToken(token)) return { error: 'Invalid Token.' };
  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) return { error: 'Authorised user is not a member of the DM.' };

  const data = getData();
  let new_members = [];
  let position = 0;
  for (let i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId) {
      position = i;
    }
  }
  for (const i of data.dms[position].members) {
    if (i !== authUserId) {
      new_members.push(i);
    }
  }

  data.dms[position] = {
    dmId: data.dms[position].dmId,
    name: data.dms[position].name,
    members: new_members,
  };
  setData(data);
  
  return {};
}