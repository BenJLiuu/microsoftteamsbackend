import { getData, setData } from './dataStore';
import { Empty, DmId, Start, Token, UIds } from './interfaceTypes';
import { DmDetails, MessageList, DMsObj, PrivateDm } from './internalTypes';
import {
  validUserId,
  validToken,
  getUserIdFromToken,
  gethandleStrFromId,
  validDmId,
  checkUserIdtoDm,
  getPublicUser
} from './helper';
import HTTPError from 'http-errors';

/**
  * Creates and stores a new DM.
  *
  * @param {Token} token - Token of user creating the dm.
  * @param {UIds} uIds - Array of user ids, reffering to users added to the dm.
  *
  * @returns {Error} {error: 'Invalid User Id.'}  - any uId in arrray does not correspond to an existing user.
  * @returns {Error} {error: 'Duplicate User Id found.'} - duplicate user id found in uIds array.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {{dmId: DmId}} {dmId: number} - if creation is successfull.
*/
export function dmCreateV2(token: Token, uIds: UIds): {dmId: DmId} {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  for (const i of uIds) {
    if (!validUserId(i)) throw HTTPError(400, 'Invalid User Id.');
  }
  if (uIds.length !== Array.from(new Set(uIds)).length) throw HTTPError(400, 'Duplicate User Id found.');

  const data = getData();
  const authUserId = getUserIdFromToken(token);
  const names = [];
  const members = [];

  names.push(gethandleStrFromId(authUserId));
  members.push(getPublicUser(data.users.find(user => user.uId === authUserId)));
  if (uIds.length !== 0) {
    for (const uId of uIds) {
      members.push(getPublicUser(data.users.find(user => user.uId === uId)));
      names.push(gethandleStrFromId(uId));
      const userIndex = data.users.findIndex(user => user.uId === uId);
      data.users[userIndex].userStats = userStatsJoinDm(uId);
    }
  }

  names.sort(function(a, b) {
    return a.localeCompare(b);
  });

  const name = names.join(', ');
  const ownerIndex = data.users.findIndex(user => user.uId === authUserId);
  data.users[ownerIndex].userStats = userStatsJoinDm(authUserId);
  let newdmId = 0;
  while (data.dms.some(c => c.dmId === newdmId)) newdmId++;
  const newDm: PrivateDm = {
    dmId: newdmId,
    name: name,
    members: members,
    owner: getPublicUser(data.users[ownerIndex]),
    messages: []
  };
  if (uIds.length !== 0) {
    for (const uId of uIds) {
      const userIndex = data.users.findIndex(user => user.uId === uId);
      const notification = {
        channelId: -1,
        dmId: newdmId,
        notificationMessage: data.users[ownerIndex].handleStr + ' added you to ' + name,
      };
      data.users[userIndex].notifications.push(notification);
    }
  }

  data.dms.push(newDm);
  setData(data);

  return { dmId: newDm.dmId };
}

/**
  * Lists all DMs that the user is a member of.
  *
  * @param {Token} token - Token of user checking each dm.
  *
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {DMsObj} dms - array of objects containing information about each dm.
*/
export function dmListV2(token: Token): DMsObj {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');

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
  * @param {Token} token - Token of user leaving the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to leave.
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {Empty} {} - DM has been succesfully left.
*/
export function dmLeaveV2(token: Token, dmId: DmId): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (!validDmId(dmId)) throw HTTPError(400, 'Invalid DM Id.');

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) throw HTTPError(400, 'Authorised user is not a member of the DM.');

  const data = getData();
  const position = data.dms.findIndex(dm => dm.dmId === dmId);
  const dmIndex = data.dms[position].members.findIndex(user => user.uId === authUserId);
  data.dms[position].members.splice(dmIndex, 1);

  const userIndex = data.users.findIndex(user => user.uId === uId);
  data.users[userIndex].userStats = userStatsLeaveDm(uId);

  setData(data);

  return {};
}

/**
  * Deletes a DM entirely.
  *
  * @param {Token} token - Token of user deleting the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to delete.
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {Empty} {} - DM has been succesfully left.
*/
export function dmRemoveV2(token: Token, dmId: DmId): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (!validDmId(dmId)) throw HTTPError(400, 'Invalid DM Id.');

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) throw HTTPError(400, 'Authorised user is not a member of the DM.');

  const data = getData();
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  if (authUserId !== data.dms[dmIndex].owner.uId) throw HTTPError(400, 'Authorised user is not owner of DM.');

  data.dms.splice(dmIndex, 1);
  setData(data);

  return {};
}

/**
  * Given a DM, returns its name and members.
  *
  * @param {Token} token - Token of user deleting the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to delete.
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {DmDetails} DmDetails if Dm exists and user is a valid candidate to view its details.
*/
export function dmDetailsV2(token: Token, dmId: DmId): DmDetails {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (!validDmId(dmId)) throw HTTPError(400, 'Invalid DM Id.');

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) throw HTTPError(400, 'Authorised user is not a member of the DM.');

  const data = getData();
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  const dmInfo = {
    name: data.dms[dmIndex].name,
    members: data.dms[dmIndex].members
  };

  return dmInfo;
}

/**
  * Views 50 or less messages in a given Dm
  *
  * @param {Token} token - Token of user deleting the dm.
  * @param {DmId} dmId - Id of the DM that the user wants to delete.
  * @param {Start} start - offset of messages from the most recent to begin displaying from
  *
  * @returns {Error} {error: 'Invalid DM Id.'}  - DM Id does not correspond to an existing DM.
  * @returns {Error} {error: 'Authorised user is not a member of the DM.'} - The user is not a member of the DM.
  * @returns {Error} {error: 'Invalid Token.'} - token does not correspond to an existing user.
  * @returns {Error} {error: 'Start is greater than total messages'} - start offset is higher than total messages.
  * @returns {MessageList} DM messages if valid.
*/
export function dmMessagesV2(token: Token, dmId: DmId, start: Start): MessageList {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  if (!validDmId(dmId)) throw HTTPError(400, 'Invalid DM Id.');

  const authUserId = getUserIdFromToken(token);
  if (!checkUserIdtoDm(authUserId, dmId)) throw HTTPError(400, 'Authorised user is not a member of the DM.');

  const data = getData();
  const dmIndex = data.dms.findIndex(dm => dm.dmId === dmId);
  if (start > data.dms[dmIndex].messages.length) throw HTTPError(400, 'Start is greater than total messages');

  let end = Math.min(data.dms[dmIndex].messages.length, start + 50);

  const messagesArray = [];
  for (let i = start; i < end; i++) messagesArray.push(data.dms[dmIndex].messages[i]);
  if (end === data.dms[dmIndex].messages.length) end = -1;
  messagesArray.sort((a, b) => b.timeSent - a.timeSent);

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}
