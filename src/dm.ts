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
export function DmCreateV1(token: string, uIds: number[]): dmId | Error {
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

export function DmLeaveV1() {
  return{};
}